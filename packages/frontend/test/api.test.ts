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

const testClient = (handler: NextApiHandler, query: { [key: string]: string | number }) => {
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

const postsClient = testClient(postsHandler, {});
const privKey = Buffer.from(''.padStart(64, '1'), 'hex');

const expectStatus = (res: Response, status: number) => {
  if (res.status !== status) {
    console.log(res.body);
  }
  expect(res.status).toBe(status);
};

const mockFindTreeNodeOnce = (_merkleProof: MerkleProof) => {
  prismaMock.treeNode.findFirst.mockResolvedValueOnce({
    address: `0x${privateToAddress(privKey).toString('hex')}`,
    pubkey: `0x${privateToPublic(privKey).toString('hex')}`,
    type: 'OneNoun',
    createdAt: new Date(),
    indices: _merkleProof.pathIndices.map((i) => i.toString()),
    path: _merkleProof.siblings.map((s) => `0x${s.toString(16)}`),
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

  const typedContent = toTypedContent(content);
  typedContentHash = eip712MsgHash(typedContent.domain, typedContent.types, typedContent.value);

  const contentSig = ecsign(typedContentHash, privKey);
  contentSigStr = toCompactSig(contentSig.v, contentSig.r, contentSig.s);

  mockPost = toPost(content, contentSigStr, AttestationScheme.EIP712);
});

describe('POST /api/v1/posts', () => {
  beforeEach(async () => {
    // ########################
    // Mock the DB queries
    // ########################
    prismaMock.post.create.mockImplementation();
  });

  describe('Nym posts', () => {
    let proof: Buffer;

    beforeAll(async () => {
      // ########################
      // Generate the proof
      // ########################

      // Prepare the nym signature
      const nymName = 'satoshi';
      const typedNym = toTypedNymName(nymName);
      const typedNymHash = eip712MsgHash(typedNym.domain, typedNym.types, typedNym.value);
      const nymSig = ecsign(typedNymHash, privKey);

      // Prove!

      // Initialize prover
      const config = {
        witnessGenWasm: path.join(__dirname, './circuit_artifacts/nym_ownership.wasm'),
        circuitUrl: path.join(__dirname, './circuit_artifacts/nym_ownership.circuit'),
        enableProfiler: true,
      };
      const prover = new NymProver(config);
      await prover.initWasm();

      proof = await prover.prove(
        nymName,
        content,
        toCompactSig(nymSig.v, nymSig.r, nymSig.s),
        contentSigStr,
        merkleProof,
      );
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
      // The API should return the id of the created post
      expectStatus(response, 200);
      expect(response.body).toMatchObject({
        postId: post.id,
      });
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

      // Reset the proof
      proof[0] = proof[0] - 1;

      expectStatus(response, 400);
      // TODO: Make the error messages constants
      expect(response.body).toMatchObject({
        error: 'Invalid proof!',
      });
    });

    it('should return 400 if the Merkle root is invalid', async () => {
      mockFindTreeNodeOnce(merkleProof);
      // Simulate by not running `mockFindTreeOnce`

      const response = await postsClient.post('/api/v1/posts').send({
        attestation: proof.toString('hex'),
        attestationScheme: AttestationScheme.Nym,
        content,
      });

      expectStatus(response, 400);
      expect(response.body).toMatchObject({
        error: 'Invalid Merkle root!',
      });
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
      // The API should return the id of the created post
      expectStatus(response, 200);
      expect(response.body).toMatchObject({
        postId,
      });
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
      expectStatus(response, 400);
    });

    it('should return 400 if the public key isn`t in the group', async () => {
      mockFindTreeOnce(treeRoot);

      // Simulate non-inclusion by not running `mockFindTreeNodeOnce`
      const response = await postsClient.post('/api/v1/posts').send({
        attestation: contentSigStr,
        attestationScheme: AttestationScheme.EIP712,
        content,
      });
      expectStatus(response, 400);
    });
  });
});

describe('GET /api/v1/posts/{postId}/upvote', () => {
  let upvotesClient: any;
  const timestamp = Math.round(Date.now() / 1000);
  let upvoteSig: string;
  beforeAll(() => {
    prismaMock.doxedUpvote.create.mockImplementation();

    upvotesClient = testClient(upvoteHandler, {
      postId: mockPost.id,
    });

    const typedUpvote = toTypedUpvote(mockPost.id, timestamp, treeRoot);
    const typedUpvoteHash = eip712MsgHash(typedUpvote.domain, typedUpvote.types, typedUpvote.value);
    const { v, r, s } = ecsign(typedUpvoteHash, privKey);
    upvoteSig = toCompactSig(v, r, s);
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
      expectStatus(response, 200);
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
      expectStatus(response, 400);
    });

    it('should return 400 if the public key isn`t in the group', async () => {
      mockFindTreeOnce(treeRoot);

      // Simulate non-inclusion by not running `mockFindTreeNodeOnce`
      const response = await upvotesClient.post(`/api/v1/posts/${mockPost.id}/upvote`).send({
        timestamp,
        groupRoot: treeRoot,
        sig: upvoteSig,
      });
      expectStatus(response, 400);
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

      prismaMock.doxedUpvote.findFirstOrThrow.mockResolvedValue({
        id: upvote.id,
        postId: upvote.postId,
        timestamp: new Date(upvote.timestamp),
        groupRoot: upvote.groupRoot,
        sig: `0x${upvote.attestation.toString('hex')}`,
        address: `0x${privateToAddress(privKey).toString('hex')}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await upvotesClient.post(`/api/v1/posts/${mockPost.id}/upvote`).send({
        timestamp,
        groupRoot: treeRoot,
        sig: upvoteSig,
      });

      expectStatus(response, 400);
    });
  });
});
