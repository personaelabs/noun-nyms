import prisma from "../../../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { ecrecover, hashPersonalMessage, pubToAddress } from "@ethereumjs/util";


// Handle non-pseudonymous upvotes
// Verify the ECDSA signature and save the upvote
const handleUpvote = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    sig,
    timestamp
  }: {
    sig: string;
    timestamp: number;
    address: string;
  } = req.body;

  const msgHash = hashPersonalMessage(
    Buffer.from(JSON.stringify({
      postId: req.query.postId as string,
      timestamp
    }), "utf8")
  );

  const r = Buffer.from(sig.slice(0, 64), "hex");
  const s = Buffer.from(sig.slice(64, 128), "hex");
  const v = BigInt("0x" + sig.slice(128, 130));

  const pubkey = ecrecover(msgHash, v, r, s);
  const address = pubToAddress(pubkey);
    
  if (address.toString("hex") != req.body.address) {
    res.status(400).send("Recovered address does not match the provided address");
    return;
  }

  await prisma.doxedUpvote.create({
    data: {
      sig,
      timestamp: new Date(timestamp * 1000),
      postId: req.query.postId as string,
      upvoteBy: address.toString("hex")
    }
  });

  res.send(200);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method == "POST") {
    await handleUpvote(req, res);
  } else {
    res.status(400).send("Unsupported method");
  }
}
