import path from 'path';
import prisma from '@/lib/prisma';
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
import {
  verifyInclusion,
  getNymFromAttestation,
  getRootFromParent,
  selectAndCleanPosts,
  isTimestampValid,
  getPostDepthFromParent,
} from '../v1/utils';
import { IPostPreview } from '@/types/api';
import fs from 'fs';
import {
  EMPTY_BODY,
  EMPTY_TITLE,
  INVALID_MERKLE_ROOT,
  INVALID_PROOF,
  INVALID_SIGNATURE,
  INVALID_TIMESTAMP,
  PARENT_NOT_FOUND,
  USER_NOT_IN_LATEST_GROUP,
} from '@/lib/errors';

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
const handleGetPosts = async (req: NextApiRequest, res: NextApiResponse<IPostPreview[]>) => {
  const skip = req.query.offset ? parseInt(req.query.offset as string) : 0;
  const take = req.query.limit ? parseInt(req.query.limit as string) : 10;
  const sort = req.query.sort ? (req.query.sort as string) : 'timestamp'; // 'upvotes' or 'timestamp'. Default is 'timestamp'.

  const posts = await selectAndCleanPosts({ skip, take, sort });
  res.send(posts);
};

// Handle non-pseudonymous post creation
// Verify the ECDSA signature and save the post
const handleCreateDoxedPost = async (
  req: NextApiRequest,
  res: NextApiResponse<{} | { error: string }>,
) => {
  const content: Content = req.body.content;
  const sig: string = req.body.attestation;

  if (!isTimestampValid(content.timestamp)) {
    res.status(400).send({ error: INVALID_TIMESTAMP });
    return;
  }

  if (!verifyRoot(content.groupRoot)) {
    res.status(400).send({ error: INVALID_MERKLE_ROOT });
    return;
  }

  const post = toPost(content, sig, AttestationScheme.EIP712);
  let pubKey;
  try {
    pubKey = recoverPostPubkey(post);
  } catch (_err) {
    res.status(400).send({ error: INVALID_SIGNATURE });
    return;
  }

  if (!(await verifyInclusion(pubKey))) {
    res.status(400).send({ error: USER_NOT_IN_LATEST_GROUP });
    return;
  }

  const address = `0x${pubToAddress(Buffer.from(pubKey.replace('0x', ''), 'hex')).toString('hex')}`;
  const rootId = await getRootFromParent(content.parentId);

  // Get the depth of the post from its parent.
  const depth = await getPostDepthFromParent(content.parentId);

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
      userId: address,
      depth,
    },
  });

  res.status(200).send({ postId: post.id });
};

let verifierInitialized = false;
let verifier: NymVerifier;
let circuitBin: Buffer;

// Handle pseudonymous post creation
// Verify the proof and save the post
const handleCreatePseudoPost = async (
  req: NextApiRequest,
  res: NextApiResponse<{ postId: string } | { error: string }>,
) => {
  const attestation: Buffer = Buffer.from(req.body.attestation.replace('0x', ''), 'hex');
  const content: Content = req.body.content;

  const post = toPost(content, attestation, AttestationScheme.Nym);

  if (!verifierInitialized) {
    // Fetch circuit and load to memory if not already loaded
    if (!circuitBin) {
      const data = await fetch(
        'https://storage.googleapis.com/personae-proving-keys/nym/nym_ownership.circuit',
      );
      circuitBin = Buffer.from(await data.arrayBuffer());
    }

    // Initialize the verifier
    verifier = new NymVerifier({
      circuitBin,
      enableProfiler: true,
    });

    await verifier.initWasm();
    verifierInitialized = true;
  }

  // Verify the Content

  const proofVerified = await verifier.verify(post);
  if (!proofVerified) {
    console.log('Proof verification failed!');
    res.status(400).send({ error: INVALID_PROOF });
    return;
  }

  if (!(await verifyRoot(content.groupRoot))) {
    res.status(400).send({ error: INVALID_MERKLE_ROOT });
    return;
  }

  // After this point, we can assume that the attestation is valid.

  if (!isTimestampValid(content.timestamp)) {
    res.status(400).send({ error: INVALID_TIMESTAMP });
    return;
  }

  const nym = getNymFromAttestation(attestation);
  const rootId = await getRootFromParent(content.parentId);

  // Get the depth of the post from its parent.
  const depth = await getPostDepthFromParent(content.parentId);

  const attestationHex = `0x${attestation.toString('hex')}`;

  await prisma.post.create({
    data: {
      id: post.id,
      parentId: content.parentId === '0x0' ? null : content.parentId,
      rootId,
      venue: content.venue,
      title: content.title,
      body: content.body,
      groupRoot: content.groupRoot,
      timestamp: new Date(content.timestamp * 1000),
      attestation: attestationHex,
      attestationScheme: PrismaAttestationScheme.Nym,
      hashScheme: HashScheme.Keccak256,
      userId: nym,
      depth,
    },
  });

  res.status(200).send({ postId: post.id });
};

// Entry point for the API below /api/v1/posts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method == 'POST') {
    // Check that specified parent exists
    const parentId = req.body.content.parentId;
    if (parentId !== '0x0') {
      const parent = await prisma.post.findFirst({
        where: {
          id: parentId,
        },
      });

      if (!parent) {
        res.status(400).send({ error: PARENT_NOT_FOUND });
        return;
      }
    }

    // Check that title is not empty if the post is not a reply
    if (req.body.content.parentId === '0x0' && req.body.content.title === '') {
      res.status(400).send({ error: EMPTY_TITLE });
      return;
    }

    // Check that the body is not empty
    if (!req.body.content.body) {
      res.status(400).send({ error: EMPTY_BODY });
      return;
    }

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
