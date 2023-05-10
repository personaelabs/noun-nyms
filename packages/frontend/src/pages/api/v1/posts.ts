import prisma from '../../../lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  NymVerifier,
  AttestationScheme,
  toPost,
  Content,
  recoverPostPubkey,
} from '@personaelabs/nymjs';
import { HashScheme, AttestationScheme as PrismaAttestationScheme } from '@prisma/client';
import { pubToAddress } from '@ethereumjs/util';
import { verifyInclusion, getNymFromAttestation, getRootFromParent } from '../v1/utils';

const isTimestampValid = (timestamp: number): boolean => {
  const now = Math.floor(Date.now() / 1000);
  return Math.abs(now - timestamp) < 100;
};

// Check if the given root exists in the database or not
const verifyRoot = async (root: string): Promise<boolean> =>
  (await prisma.tree.findFirst({
    where: {
      root,
    },
  }))
    ? true
    : false;

// Return posts as specified by the query parameters
const handleGetPosts = async (req: NextApiRequest, res: NextApiResponse) => {
  const skip = req.query.offset ? parseInt(req.query.offset as string) : 0;
  const take = req.query.limit ? parseInt(req.query.limit as string) : 10;

  const postsRaw = await prisma.post.findMany({
    select: {
      id: true,
      title: true,
      body: true,
      timestamp: true,
      user: true,
      _count: {
        select: {
          descendants: true,
          upvotes: true,
        },
      },
    },
    where: {
      // Only return root posts
      rootId: null,
    },
    skip,
    take,
    orderBy: {
      timestamp: 'desc',
    },
  });

  // Format the data returned from the database
  const posts = postsRaw.map((post) => ({
    id: post.id,
    title: post.title,
    body: post.body,
    timestamp: post.timestamp,
    user: post.user,
    replyCount: post._count.descendants,
    upvoteCount: post._count.upvotes,
  }));

  res.send(posts);
};

// Handle non-pseudonymous post creation
// Verify the ECDSA signature and save the post
const handleCreateDoxedPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const content: Content = req.body.content;
  const sig: string = req.body.attestation;

  if (!isTimestampValid(content.timestamp)) {
    res.status(400).send('Invalid timestamp!');
    return;
  }

  if (!verifyRoot(content.groupRoot)) {
    res.status(400).send('Invalid group root!');
    return;
  }

  const post = toPost(content, sig, AttestationScheme.EIP712);
  const pubKey = recoverPostPubkey(post);
  console.log({ pubKey });

  if (!(await verifyInclusion(pubKey))) {
    res.status(400).send('Public key not in latest group');
    return;
  }

  const address = pubToAddress(Buffer.from(pubKey.replace('0x', ''), 'hex')).toString('hex');
  const rootId = await getRootFromParent(content.parentId);

  await prisma.post.create({
    data: {
      id: post.id,
      rootId,
      venue: content.venue,
      title: content.title,
      groupRoot: content.groupRoot,
      body: content.body,
      parentId: content.parentId === '0x0' ? null : content.parentId,
      timestamp: new Date(content.timestamp * 1000),
      attestation: sig,
      attestationScheme: PrismaAttestationScheme.EIP712,
      hashScheme: HashScheme.Keccak256,
      user: address,
    },
  });

  res.status(200).send({ postId: post.id });
};

let verifierInitialized = false;
const verifier = new NymVerifier({
  circuitUrl: './nym_ownership.circuit',
  enableProfiler: true,
});

// Handle pseudonymous post creation
// Verify the proof and save the post
const handleCreatePseudoPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const attestation: Buffer = Buffer.from(req.body.attestation.replace('0x', ''), 'hex');
  const content: Content = req.body.content;

  const post = toPost(content, attestation, AttestationScheme.Nym);

  if (!verifierInitialized) {
    await verifier.initWasm();
    verifierInitialized = true;
  }

  // Verify the Content

  const proofVerified = await verifier.verify(post);
  if (!proofVerified) {
    console.log('Proof verification failed!');
    res.status(400).send('Invalid proof!');
    return;
  }

  if (!(await verifyRoot(content.groupRoot.replace('0x', '')))) {
    res.status(400).send('Invalid Merkle root!');
    return;
  }

  // After this point, we can assume that the attestation is valid.

  if (!isTimestampValid(content.timestamp)) {
    res.status(400).send('Invalid timestamp!');
    return;
  }

  const nym = getNymFromAttestation(attestation);
  const rootId = await getRootFromParent(content.parentId);

  await prisma.post.create({
    data: {
      id: post.id,
      parentId: content.parentId,
      rootId,
      venue: content.venue,
      title: content.title,
      body: content.body,
      groupRoot: content.groupRoot,
      timestamp: new Date(content.timestamp * 1000),
      attestation: attestation.toString('hex'),
      attestationScheme: PrismaAttestationScheme.Nym,
      hashScheme: HashScheme.Keccak256,
      user: nym,
    },
  });

  res.status(200).send({ postId: post.id });
};

// Entry point for the API below /api/v1/posts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method == 'POST') {
    if (req.body.attestationScheme === AttestationScheme.Nym) {
      await handleCreatePseudoPost(req, res);
    } else if (req.body.attestationScheme === AttestationScheme.EIP712) {
      await handleCreateDoxedPost(req, res);
    } else {
      res.status(400).send('Unknown attestation scheme');
    }
  } else if (req.method == 'GET') {
    await handleGetPosts(req, res);
  } else {
    res.status(400).send('Unsupported method');
  }
}
