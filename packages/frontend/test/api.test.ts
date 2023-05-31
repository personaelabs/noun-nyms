import request, { Response } from 'supertest';
import postsHandler from '../src/pages/api/v1/posts';
import upvoteHandler from '../src/pages/api/v1/posts/[postId]/upvote';
import { apiResolver } from 'next/dist/server/api-utils/node';
import { NextApiHandler } from 'next';
import { createServer, RequestListener } from 'http';
import { prismaMock } from './prisma.mock';
import {
  AttestationScheme,
  Content,
  NymProver,
  PrefixedHex,
  eip712MsgHash,
  toTypedContent,
  toTypedNymName,
  toPost,
  Post,
  toTypedUpvote,
  toUpvote,
} from '@personaelabs/nymjs';
import * as path from 'path';
import { ecsign, privateToAddress, privateToPublic, toCompactSig } from '@ethereumjs/util';
import { MerkleProof, Poseidon, Tree } from '@personaelabs/spartan-ecdsa';
import {
  INVALID_MERKLE_ROOT,
  INVALID_PROOF,
  INVALID_SIGNATURE,
  USER_NOT_IN_LATEST_GROUP,
  ALREADY_UPVOTED,
  INVALID_TIMESTAMP,
  PARENT_NOT_FOUND,
} from '@/lib/errors';
import { prisma } from '@prisma/client';

// Create a supertest client from the Next.js API route handler
const createTestClient = (handler: NextApiHandler, query: { [key: string]: string | number }) => {
  const listener: RequestListener = (req, res) => {
    return apiResolver(
      req,
      res,
      query,
      handler,
      {
        previewModeEncryptionKey: '',
        previewModeId: '',
        previewModeSigningKey: '',
      },
      false,
    );
  };

  return request(createServer(listener));
};

const privKey = Buffer.from(''.padStart(64, '1'), 'hex');

const expectStatusWithObject = (
  res: Response,
  status: number,
  returnObject?: { [key: string]: string | number },
) => {
  if (res.status !== status) {
    console.log(res.body);
  }
  expect(res.status).toBe(status);
  if (returnObject) {
    expect(res.body).toMatchObject(returnObject);
  }
};

const mockFindTreeNodeOnce = (_merkleProof: MerkleProof) => {
  prismaMock.treeNode.findFirst.mockResolvedValueOnce({
    address: `0x${privateToAddress(privKey).toString('hex')}`,
    pubkey: `0x${privateToPublic(privKey).toString('hex')}`,
    type: 'OneNoun',
    createdAt: new Date(),
    indices: _merkleProof.pathIndices.map((i) => i.toString()),
    path: _merkleProof.siblings.map((s) => `0x${s[0].toString(16)}`),
  });
};

const mockFindTreeOnce = (_treeRoot: string) => {
  // Mock the DB query that returns the tree root
  prismaMock.tree.findFirst.mockResolvedValue({
    root: _treeRoot,
    blockHeight: 0,
    createdAt: new Date(),
    type: 'OneNoun',
  });
};

let treeRoot: PrefixedHex;
let content: Content;
let mockPost: Post;
let contentSigStr: string;
let typedContentHash: Buffer;
let tree: Tree;
let pubKeyHash: bigint;
let merkleProof: MerkleProof;

const signContent = (content: Content): string => {
  const typedContent = toTypedContent(content);
  typedContentHash = eip712MsgHash(typedContent.domain, typedContent.types, typedContent.value);

  const contentSig = ecsign(typedContentHash, privKey);
  contentSigStr = toCompactSig(contentSig.v, contentSig.r, contentSig.s);
  return contentSigStr;
};

beforeAll(async () => {
  // Construct the Merkle tree
  const poseidon = new Poseidon();
  await poseidon.initWasm();
  tree = new Tree(20, poseidon);
  pubKeyHash = poseidon.hashPubKey(privateToPublic(privKey));
  tree.insert(pubKeyHash);
  treeRoot = `0x${tree.root().toString(16)}`;
  merkleProof = tree.createProof(tree.indexOf(pubKeyHash));

  // Prepare the post
  content = {
    venue: 'nouns',
    title: 'hello world',
    body: 'hello world',
    parentId: '0x0',
    groupRoot: treeRoot,
    timestamp: Math.round(Date.now() / 1000),
  };

  contentSigStr = signContent(content);

  mockPost = toPost(content, contentSigStr, AttestationScheme.EIP712);
});

describe('POST /api/v1/posts', () => {
  let postsClient: any;

  beforeEach(async () => {
    prismaMock.post.create.mockImplementation();
    postsClient = createTestClient(postsHandler, {});
  });

  describe('Nym posts', () => {
    let proof: Buffer;
    let prover: NymProver;
    const nymName = 'satoshi';
    let nymSigStr: string;

    beforeAll(async () => {
      // ########################
      // Generate a valid proof
      // ########################

      // Prepare the nym signature
      const typedNym = toTypedNymName(nymName);
      const typedNymHash = eip712MsgHash(typedNym.domain, typedNym.types, typedNym.value);
      const nymSig = ecsign(typedNymHash, privKey);
      nymSigStr = toCompactSig(nymSig.v, nymSig.r, nymSig.s);

      // Prove!

      // Initialize prover
      const config = {
        witnessGenWasm: path.join(__dirname, '../../circuits/artifacts/nym_ownership.wasm'),
        circuitUrl: path.join(__dirname, '../../circuits/artifacts/nym_ownership.circuit'),
        enableProfiler: true,
      };
      prover = new NymProver(config);
      await prover.initWasm();

      proof = await prover.prove(nymName, content, nymSigStr, contentSigStr, merkleProof);
    });

    it('should return 200 if valid', async () => {
      mockFindTreeNodeOnce(merkleProof);
      mockFindTreeOnce(treeRoot);

      // Submit the content with the proof
      const response = await postsClient.post('/api/v1/posts').send({
        attestation: proof.toString('hex'),
        attestationScheme: AttestationScheme.Nym,
        content,
      });

      const post = toPost(content, proof, AttestationScheme.Nym);

      expectStatusWithObject(response, 200, {
        postId: post.id,
      });
    });

    it('should return 400 if timestamp is over 100s ahead', async () => {
      mockFindTreeNodeOnce(merkleProof);
      mockFindTreeOnce(treeRoot);

      const validTimestamp = content.timestamp;

      const now = Math.floor(Date.now() / 1000);
      content.timestamp = now + 150;

      const proofInvalidTimestamp = await prover.prove(
        nymName,
        content,
        nymSigStr,
        signContent(content),
        merkleProof,
      );

      const response = await postsClient.post('/api/v1/posts').send({
        attestation: proofInvalidTimestamp.toString('hex'),
        attestationScheme: AttestationScheme.Nym,
        content,
      });

      expectStatusWithObject(response, 400, {
        error: INVALID_TIMESTAMP,
      });

      content.timestamp = validTimestamp;
    });

    it('should return 400 if timestamp is over 100s behind', async () => {
      mockFindTreeNodeOnce(merkleProof);
      mockFindTreeOnce(treeRoot);

      const validTimestamp = content.timestamp;

      const now = Math.floor(Date.now() / 1000);
      content.timestamp = now - 150;

      const proofInvalidTimestamp = await prover.prove(
        nymName,
        content,
        nymSigStr,
        signContent(content),
        merkleProof,
      );

      const response = await postsClient.post('/api/v1/posts').send({
        attestation: proofInvalidTimestamp.toString('hex'),
        attestationScheme: AttestationScheme.Nym,
        content,
      });

      expectStatusWithObject(response, 400, {
        error: INVALID_TIMESTAMP,
      });

      content.timestamp = validTimestamp;
    });

    it('should return 400 if proof is invalid', async () => {
      mockFindTreeNodeOnce(merkleProof);
      mockFindTreeOnce(treeRoot);

      // Simulate an invalid proof
      proof[0] = proof[0] + 1;

      const response = await postsClient.post('/api/v1/posts').send({
        attestation: proof.toString('hex'),
        attestationScheme: AttestationScheme.Nym,
        content,
      });

      proof[0] = proof[0] - 1;

      expectStatusWithObject(response, 400, {
        error: INVALID_PROOF,
      });
    });

    it('should return 400 if the Merkle root is invalid', async () => {
      mockFindTreeNodeOnce(merkleProof);
      // Simulate invalid Merkle root by not calling `mockFindTreeOnce`

      const response = await postsClient.post('/api/v1/posts').send({
        attestation: proof.toString('hex'),
        attestationScheme: AttestationScheme.Nym,
        content,
      });

      expectStatusWithObject(response, 400, {
        error: INVALID_MERKLE_ROOT,
      });
    });

    it("should return 400 if the parent doesn't exist", async () => {
      mockFindTreeNodeOnce(merkleProof);
      mockFindTreeOnce(treeRoot);
      // Simulate non-existence of parentId by returning null
      prismaMock.post.findFirst.mockResolvedValueOnce(null);

      const validParentId = content.parentId;

      // Set the parent ID to a non-existent post
      content.parentId = '0x'.padEnd(66, 'f') as PrefixedHex;

      const proofInvalidParentId = await prover.prove(
        nymName,
        content,
        nymSigStr,
        signContent(content),
        merkleProof,
      );

      const response = await postsClient.post('/api/v1/posts').send({
        attestation: proofInvalidParentId.toString('hex'),
        attestationScheme: AttestationScheme.Nym,
        content,
      });

      expectStatusWithObject(response, 400, {
        error: PARENT_NOT_FOUND,
      });

      content.parentId = validParentId;
    });
  });

  describe('Doxed posts', () => {
    it('should return 200 if valid', async () => {
      mockFindTreeNodeOnce(merkleProof);
      mockFindTreeOnce(treeRoot);

      const response = await postsClient.post('/api/v1/posts').send({
        attestation: contentSigStr,
        attestationScheme: AttestationScheme.EIP712,
        content,
      });
      const postId = toPost(content, contentSigStr, AttestationScheme.EIP712).id;

      expectStatusWithObject(response, 200, {
        postId,
      });
    });

    it('should return 400 if timestamp is over 100s ahead', async () => {
      mockFindTreeNodeOnce(merkleProof);
      mockFindTreeOnce(treeRoot);

      const validTimestamp = content.timestamp;

      const now = Math.floor(Date.now() / 1000);
      content.timestamp = now + 150;

      const response = await postsClient.post('/api/v1/posts').send({
        attestation: signContent(content),
        attestationScheme: AttestationScheme.EIP712,
        content,
      });

      expectStatusWithObject(response, 400, { error: INVALID_TIMESTAMP });
      content.timestamp = validTimestamp;
    });

    it('should return 400 if timestamp is over 100s behind', async () => {
      mockFindTreeNodeOnce(merkleProof);
      mockFindTreeOnce(treeRoot);

      const validTimestamp = content.timestamp;

      const now = Math.floor(Date.now() / 1000);
      content.timestamp = now - 150;

      const response = await postsClient.post('/api/v1/posts').send({
        attestation: signContent(content),
        attestationScheme: AttestationScheme.EIP712,
        content,
      });

      expectStatusWithObject(response, 400, {
        error: INVALID_TIMESTAMP,
      });

      content.timestamp = validTimestamp;
    });

    it('should return 400 if signature is invalid', async () => {
      mockFindTreeNodeOnce(merkleProof);
      mockFindTreeOnce(treeRoot);

      const invalidSig = '0x'.padEnd(512, 'f');
      const response = await postsClient.post('/api/v1/posts').send({
        attestation: invalidSig,
        attestationScheme: AttestationScheme.EIP712,
        content,
      });
      expectStatusWithObject(response, 400, {
        error: INVALID_SIGNATURE,
      });
    });

    it('should return 400 if the public key isn`t in the group', async () => {
      mockFindTreeOnce(treeRoot);

      // Simulate non-inclusion by not running `mockFindTreeNodeOnce`
      const response = await postsClient.post('/api/v1/posts').send({
        attestation: contentSigStr,
        attestationScheme: AttestationScheme.EIP712,
        content,
      });
      expectStatusWithObject(response, 400, {
        error: USER_NOT_IN_LATEST_GROUP,
      });
    });

    it("should return 400 if the parent doesn't exist", async () => {
      mockFindTreeNodeOnce(merkleProof);
      mockFindTreeOnce(treeRoot);
      // Simulate non-existence of parentId by returning null
      prismaMock.post.findFirst.mockResolvedValueOnce(null);

      const validParentId = content.parentId;

      // Set the parent ID to a non-existent post
      content.parentId = '0x'.padEnd(66, 'f') as PrefixedHex;

      const response = await postsClient.post('/api/v1/posts').send({
        attestation: signContent(content),
        attestationScheme: AttestationScheme.EIP712,
        content,
      });

      expectStatusWithObject(response, 400, {
        error: PARENT_NOT_FOUND,
      });

      content.parentId = validParentId;
    });
  });
});

describe('GET /api/v1/posts/{postId}/upvote', () => {
  let upvotesClient: any;
  const timestamp = Math.round(Date.now() / 1000);
  let upvoteSig: string;

  const signUpvote = (postId: string, timestamp: number, groupRoot: string): string => {
    const typedUpvote = toTypedUpvote(postId, timestamp, groupRoot);
    const typedUpvoteHash = eip712MsgHash(typedUpvote.domain, typedUpvote.types, typedUpvote.value);
    const { v, r, s } = ecsign(typedUpvoteHash, privKey);
    const upvoteSig = toCompactSig(v, r, s);
    return upvoteSig;
  };

  beforeAll(() => {
    prismaMock.doxedUpvote.create.mockImplementation();

    upvotesClient = createTestClient(upvoteHandler, {
      postId: mockPost.id,
    });

    upvoteSig = signUpvote(mockPost.id, timestamp, treeRoot);
  });

  describe('Doexed upvotes', () => {
    it('should return 200 if valid', async () => {
      mockFindTreeNodeOnce(merkleProof);
      mockFindTreeOnce(treeRoot);

      const response = await upvotesClient.post(`/api/v1/posts/${mockPost.id}/upvote`).send({
        timestamp,
        groupRoot: treeRoot,
        sig: upvoteSig,
      });
      expectStatusWithObject(response, 200);
    });

    it('should return 400 if timestamp is over 100s ahead', async () => {
      mockFindTreeNodeOnce(merkleProof);
      mockFindTreeOnce(treeRoot);

      const now = Math.floor(Date.now() / 1000);
      const invalidTimestamp = now + 150;

      const response = await upvotesClient.post(`/api/v1/posts/${mockPost.id}/upvote`).send({
        timestamp: invalidTimestamp,
        groupRoot: treeRoot,
        sig: signUpvote(mockPost.id, invalidTimestamp, treeRoot),
      });

      expectStatusWithObject(response, 400, {
        error: INVALID_TIMESTAMP,
      });
    });

    it('should return 400 if timestamp is over 100s behind', async () => {
      mockFindTreeNodeOnce(merkleProof);
      mockFindTreeOnce(treeRoot);

      const now = Math.floor(Date.now() / 1000);
      const invalidTimestamp = now - 150;

      const response = await upvotesClient.post(`/api/v1/posts/${mockPost.id}/upvote`).send({
        timestamp: invalidTimestamp,
        groupRoot: treeRoot,
        sig: signUpvote(mockPost.id, invalidTimestamp, treeRoot),
      });

      expectStatusWithObject(response, 400, {
        error: INVALID_TIMESTAMP,
      });
    });

    it('should return 400 if the signature is invalid', async () => {
      mockFindTreeNodeOnce(merkleProof);
      mockFindTreeOnce(treeRoot);

      const invalidSig = '0x'.padEnd(512, 'f');
      const response = await upvotesClient.post(`/api/v1/posts/${mockPost.id}/upvote`).send({
        timestamp,
        groupRoot: treeRoot,
        sig: invalidSig,
      });
      expectStatusWithObject(response, 400, {
        error: INVALID_SIGNATURE,
      });
    });

    it('should return 400 if the public key isn`t in the group', async () => {
      mockFindTreeOnce(treeRoot);
      // Simulate non-inclusion by not running `mockFindTreeNodeOnce`

      const response = await upvotesClient.post(`/api/v1/posts/${mockPost.id}/upvote`).send({
        timestamp,
        groupRoot: treeRoot,
        sig: upvoteSig,
      });

      expectStatusWithObject(response, 400, {
        error: USER_NOT_IN_LATEST_GROUP,
      });
    });

    it('should return 400 if the user has already upvoted', async () => {
      mockFindTreeNodeOnce(merkleProof);
      mockFindTreeOnce(treeRoot);

      await upvotesClient.post(`/api/v1/posts/${mockPost.id}/upvote`).send({
        timestamp,
        groupRoot: treeRoot,
        sig: upvoteSig,
      });

      const upvote = toUpvote(mockPost.id, treeRoot, timestamp, upvoteSig);

      prismaMock.doxedUpvote.findFirst.mockResolvedValue({
        id: upvote.id,
        postId: upvote.postId,
        timestamp: new Date(upvote.timestamp),
        groupRoot: upvote.groupRoot,
        sig: upvoteSig,
        address: `0x${privateToAddress(privKey).toString('hex')}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await upvotesClient.post(`/api/v1/posts/${mockPost.id}/upvote`).send({
        timestamp,
        groupRoot: treeRoot,
        sig: upvoteSig,
      });

      expectStatusWithObject(response, 400, {
        error: ALREADY_UPVOTED,
      });
    });
  });
});
