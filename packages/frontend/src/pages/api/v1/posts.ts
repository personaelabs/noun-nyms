import prisma from "../../../lib/prisma";
import { hashBytes } from "../../../lib/hasher";
import type { NextApiRequest, NextApiResponse } from "next";
import { ecrecover, hashPersonalMessage, pubToAddress } from "@ethereumjs/util";
import { MembershipVerifier, PublicInput } from "@personaelabs/spartan-ecdsa";

type PostBase = {
  content: string;
  title: string;
  parentId?: string;
};

type PseudoPost = {
  proof: string;
  publicInput: string;
} & PostBase;

type DoxedPost = {
  sig: string;
} & PostBase;

// Check if the given root exists in the database or not
const verifyRoot = async (root: string): Promise<boolean> =>
  (await prisma.tree.findFirst({
    where: {
      root
    }
  }))
    ? true
    : false;

// Return posts as specified by the query parameters
const handleGetPosts = async (req: NextApiRequest, res: NextApiResponse) => {
  const skip = req.query.offset ? parseInt(req.query.offset as string) : 0;
  const take = req.query.limit ? parseInt(req.query.limit as string) : 10;

  const posts = await prisma.post.findMany({
    select: {
      id: true,
      title: true,
      content: true,
      parentId: true,
      createdAt: true,
      address: true,
      upvotes: true
    },
    where: {
      parentId: req.query.parentId as string
    },
    skip: skip as number,
    take: take as number
  });

  res.send(posts);
};

// Handle non-pseudonymous post creation
// Verify the ECDSA signature and save the post
const handleCreateDoxedPost = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const post: DoxedPost = req.body;

  const postId = await hashBytes(Buffer.from(post.sig, "hex"));

  const msg = Buffer.from(
    JSON.stringify({
      content: post.content,
      title: post.title,
      parentId: post.parentId
    }),
    "utf8"
  );

  const sig = post.sig;

  const msgHash = hashPersonalMessage(msg);

  const r = Buffer.from(sig.slice(0, 64), "hex");
  const s = Buffer.from(sig.slice(64, 128), "hex");
  const v = BigInt("0x" + sig.slice(128, 130));

  const pubkey = ecrecover(msgHash, v, r, s);
  const address = pubToAddress(pubkey);

  await prisma.post.create({
    data: {
      title: post.title,
      content: post.content,
      parentId: post.parentId,
      id: postId,
      proofOrSig: sig,
      address: address.toString("hex")
    }
  });

  res.status(200).send({ postId });
};

let verifierInitialized = false;
const verifier = new MembershipVerifier({
  circuit: "./pubkey_membership.circuit",
  enableProfiler: true
});

// Handle pseudonymous post creation
// Verify the proof and save the post
const handleCreatePseudoPost = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const post: PseudoPost = req.body;

  const postId = await hashBytes(
    Buffer.from(post.proof + post.publicInput, "hex")
  );

  if (!verifierInitialized) {
    await verifier.initWasm();
    verifierInitialized = true;
  }

  // Verify the NIZK proof

  const proofSer = Buffer.from(post.proof, "hex");
  const publicInputSer = Buffer.from(post.publicInput, "hex");

  const proofVerified = await verifier.verify(proofSer, publicInputSer);
  if (!proofVerified) {
    console.log("Proof verification failed!");
    res.status(400).send("Invalid proof!");
    return;
  }

  // Verify that the msgHash in the public input matches the expected msgHash

  const expectedMsgHash = hashPersonalMessage(
    Buffer.from(
      JSON.stringify({
        content: post.content,
        title: post.title,
        parentId: post.parentId
      })
    )
  ).toString("hex");

  const pubInput = PublicInput.deserialize(publicInputSer);

  if (expectedMsgHash !== pubInput.msgHash.toString("hex")) {
    res.status(400).send("Invalid public input!");
    return;
  }

  if (!(await verifyRoot(pubInput.circuitPubInput.merkleRoot.toString(16)))) {
    res.status(400).send("Invalid Merkle root!");
    return;
  }

  console.log("Proof verified");
  await prisma.post.create({
    data: {
      title: post.title,
      content: post.content,
      proofOrSig: post.proof,
      id: postId,
      parentId: post.parentId
    }
  });
  res.status(200).send({ postId });
};

// Entry point for the API below /api/v1/posts
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method == "POST") {
    if (req.body.proof) {
      await handleCreatePseudoPost(req, res);
    } else if (req.body.sig) {
      await handleCreateDoxedPost(req, res);
    } else {
      res.status(400).send("Either provide proof or sig in request body");
    }
  } else if (req.method == "GET") {
    await handleGetPosts(req, res);
  } else {
    res.status(400).send("Unsupported method");
  }
}
