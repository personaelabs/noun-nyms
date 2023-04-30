import prisma from '../../../lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import { NymVerifier, AttestationScheme, toContent, ContentMessage } from '@personaelabs/nymjs';
import { deserializeNymAttestation, recoverContentSigner } from '@personaelabs/nymjs/build/utils';

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

  const posts = await prisma.post.findMany({
    select: {
      id: true,
      title: true,
      body: true,
      parentId: true,
      createdAt: true,
      address: true,
      upvotes: true,
    },
    where: {
      parentId: req.query.parentId as string,
    },
    skip: skip as number,
    take: take as number,
  });

  res.send(posts);
};

// Handle non-pseudonymous post creation
// Verify the ECDSA signature and save the post
const handleCreateDoxedPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const contentMessage = req.body.contentMessage;
  const sig: string = req.body.attestation;

  if (!isTimestampValid(contentMessage.timestamp)) {
    res.status(400).send('Invalid timestamp!');
    return;
  }

  const content = toContent(contentMessage, sig, AttestationScheme.EIP712);
  const address = recoverContentSigner(content);

  await prisma.post.create({
    data: {
      title: contentMessage.title,
      body: contentMessage.body,
      parentId: contentMessage.parentId,
      timestamp: new Date(contentMessage.timestamp * 1000),
      venue: contentMessage.venue,
      id: content.id,
      proofOrSig: sig,
      address,
    },
  });

  res.status(200).send({ contentId: content.id });
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
  const contentMessage: ContentMessage = req.body.contentMessage;

  const content = toContent(contentMessage, attestation, AttestationScheme.Nym);

  if (!verifierInitialized) {
    await verifier.initWasm();
    verifierInitialized = true;
  }

  // Verify the Content

  const proofVerified = await verifier.verify(content);
  if (!proofVerified) {
    console.log('Proof verification failed!');
    res.status(400).send('Invalid proof!');
    return;
  }

  const { publicInput } = deserializeNymAttestation(attestation);

  if (!(await verifyRoot(publicInput.root.toString(16)))) {
    res.status(400).send('Invalid Merkle root!');
    return;
  }

  // After this point, we can assume that the attestation is valid.

  if (!isTimestampValid(contentMessage.timestamp)) {
    res.status(400).send('Invalid timestamp!');
    return;
  }

  await prisma.post.create({
    data: {
      title: contentMessage.title,
      body: contentMessage.body,
      timestamp: new Date(contentMessage.timestamp * 1000),
      venue: contentMessage.venue,
      proofOrSig: attestation.toString('hex'),
      id: content.id,
      parentId: contentMessage.parentId,
    },
  });

  res.status(200).send({ contentId: content.id });
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
