// Since proofs rely on an RNG,
// test data populated by this script is NOT deterministic.

// Following the non-deterministic nature of proofs,
// data that aren’t related to proofs are
// also internally made non-deterministic (by using `Date.now()` to sample the timestamp).

import 'dotenv/config';
import * as path from 'path';
import { PrismaClient, NymPost, HashScheme, DoxedPost, GroupType } from '@prisma/client';
import testData, { TestData } from './testData';
import { ecsign, privateToAddress, privateToPublic, toCompactSig } from '@ethereumjs/util';
import {
  AttestationScheme,
  Content,
  eip712MsgHash,
  toPost,
  toTypedContent,
  NymProver,
  toTypedNymCode,
  toTypedUpvote,
  toUpvote,
  PrefixedHex,
} from '@personaelabs/nymjs';
import { Poseidon, Tree } from '@personaelabs/spartan-ecdsa';

const PRIV_KEYS = new Array(10).fill(0).map((_, i) => {
  return Buffer.from((i + 1).toString(16).padStart(64, '0'), 'hex');
});

const prisma = new PrismaClient();

const NYMS = [
  'PixelPirate',
  'CyberCupid',
  'EmojiWarrior',
  'MysticMuse',
  'TechTrendsetter',
  'NetNinja',
  'DigitalDreamer',
  'GamerGuru',
  'CodeConnoisseur',
  'TechnoGypsy',
];

const NUM_TOTAL_UPVOTES = 100;

const log = (msg: string) => {
  process.stdout.write(`${msg}`);
};

const populateTestData = async () => {
  // ##############################
  // Construct a dummy tree that only includes the dev accounts
  // ##############################

  const poseidon = new Poseidon();
  await poseidon.initWasm();
  const tree = new Tree(20, poseidon);

  const pubKeyHashes = PRIV_KEYS.map((privKey) => {
    return poseidon.hashPubKey(privateToPublic(privKey));
  });

  for (let i = 0; i < PRIV_KEYS.length; i++) {
    tree.insert(pubKeyHashes[i]);
  }

  const treeRootHex: `0x${string}` = `0x${tree.root().toString(16)}`;

  log(`Creating: \n`);
  log(`- ${NUM_TOTAL_UPVOTES} total upvotes\n`);

  log(`from ${PRIV_KEYS.length} accounts\n`);
  log(`\n`);

  // ##############################
  // Create doxed posts
  // ##############################

  const doxedPosts: DoxedPost[] = [];

  // Format test data into Primsa type `DoxedPost`
  const createDoxedPost = (title: string, body: string, privKey: Buffer, parentId: PrefixedHex) => {
    const content: Content = {
      title: title,
      body: body,
      timestamp: Math.round(Date.now() / 1000),
      parentId,
      venue: 'nouns',
      groupRoot: treeRootHex,
    };

    const typedContent = toTypedContent(content);
    const typedContentHash = eip712MsgHash(
      typedContent.domain,
      typedContent.types,
      typedContent.value,
    );

    const { v, r, s } = ecsign(typedContentHash, privKey);
    const sig = toCompactSig(v, r, s);
    const post = toPost(content, sig, AttestationScheme.EIP712);

    return {
      id: post.id,
      title: post.content.title,
      body: post.content.body,
      timestamp: new Date(post.content.timestamp * 1000),
      parentId: post.content.parentId,
      venue: post.content.venue,
      groupRoot: post.content.groupRoot,
      sig,
      address: privateToAddress(privKey).toString('hex'),
      hashScheme: HashScheme.Keccak256,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  };

  // Recursively create Primsa type `DoxedPost` from post and its replies
  const createDoxedPostWithReplies = (parentId: PrefixedHex, data: TestData): DoxedPost[] => {
    const privKey = PRIV_KEYS[Math.floor(Math.random() * PRIV_KEYS.length)];
    const doxedPost = createDoxedPost(data.title, data.body, privKey, parentId);

    const replies = data.replies.map((reply) => {
      return createDoxedPostWithReplies(doxedPost.id as PrefixedHex, reply);
    });

    return [doxedPost, ...replies.flat()];
  };

  log('Preparing dummy doxed posts...');
  for (let i = 0; i < testData.length; i++) {
    const data = testData[i];

    doxedPosts.push(...createDoxedPostWithReplies('0x0', data));
  }
  log('...done\n');

  /*
  // ##############################
  // Create Nym posts
  // ##############################

  log('Preparing dummy Nym posts (this takes a bit)...');

  const prover = new NymProver({
    circuitUrl: path.join(__dirname, './circuit_artifacts/nym_ownership.circuit'),
    witnessGenWasm: path.join(__dirname, './circuit_artifacts/nym_ownership.wasm'),
  });

  await prover.initWasm();

  const nymSigs: string[] = NYMS.map((nymCode, i) => {
    const typedNymCode = toTypedNymCode(nymCode);
    const nymCodeHash = eip712MsgHash(typedNymCode.domain, typedNymCode.types, typedNymCode.value);
    const { v, r, s } = ecsign(nymCodeHash, PRIV_KEYS[i]);
    const sig = toCompactSig(v, r, s);

    return sig;
  });

  const nymPosts: NymPost[] = [];

  for (let i = 0; i < nymPostsTestData.length; i++) {
    const data = nymPostsTestData[i];

    const nymIndex = i % NYMS.length;
    const privKey = PRIV_KEYS[nymIndex];
    const nymCode = NYMS[nymIndex];
    const nymSig = nymSigs[nymIndex];

    const parentId = i % 3 === 1 ? (nymPosts[i - 1].id as PrefixedHex) : '0x0';

    const content: Content = {
      title: data.title,
      body: data.body,
      timestamp: Math.round(Date.now() / 1000),
      parentId,
      venue: 'nouns',
      groupRoot: treeRootHex,
    };

    const typedContent = toTypedContent(content);
    const typedContentHash = eip712MsgHash(
      typedContent.domain,
      typedContent.types,
      typedContent.value,
    );

    const { v, r, s } = ecsign(typedContentHash, privKey);
    const contentSig = toCompactSig(v, r, s);

    const merkleProof = tree.createProof(tree.indexOf(pubKeyHashes[nymIndex]));

    const attestation = await prover.prove(nymCode, content, nymSig, contentSig, merkleProof);
    const attestationHex = attestation.toString('hex');

    const post = toPost(content, attestation, AttestationScheme.Nym);

    nymPosts.push({
      id: post.id,
      venue: post.content.venue,
      title: post.content.title,
      body: post.content.body,
      parentId: post.content.parentId,
      groupRoot: post.content.groupRoot,
      timestamp: new Date(post.content.timestamp * 1000),
      fullProof: attestationHex,
      hashScheme: HashScheme.Keccak256,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  log('...done\n');

  // ##############################
  // Create upvotes
  // ##############################

  log('Creating dummy upvotes...');
  const allPosts = [...doxedPosts, ...nymPosts];
  const upvotes = new Array(NUM_TOTAL_UPVOTES).fill(0).map((_, i) => {
    const timestamp = Math.round(Date.now() / 1000);
    const signer = PRIV_KEYS[i % PRIV_KEYS.length];
    const postId = allPosts[i % allPosts.length].id as PrefixedHex;

    const typedUpvote = toTypedUpvote(postId, timestamp, treeRootHex);
    const typedUpvoteHash = eip712MsgHash(typedUpvote.domain, typedUpvote.types, typedUpvote.value);
    const { v, r, s } = ecsign(typedUpvoteHash, signer);
    const sig = toCompactSig(v, r, s);

    const upvote = toUpvote(postId as PrefixedHex, treeRootHex, timestamp, sig);

    return {
      id: upvote.id,
      postId: upvote.postId,
      groupRoot: treeRootHex,
      sig,
      address: privateToAddress(signer).toString('hex'),
      timestamp: new Date(upvote.timestamp * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
  log('...done\n');
  */

  log('Saving to database...');
  // ##############################
  // Save everything to the database
  // ##############################

  await prisma.doxedPost.createMany({
    // We only store newly added posts
    data: doxedPosts,
  });

  /*
  // Save the nym posts to the database
  await prisma.nymPost.createMany({
    // We only store newly added posts
    data: nymPosts,
  });

  await prisma.doxedUpvote.createMany({
    data: upvotes,
  });

  // Save the dummy tree to the database
  const treeExists = await prisma.tree.findFirst({
    where: {
      root: treeRootHex,
    },
  });

  if (!treeExists) {
    await prisma.tree.create({
      data: {
        root: treeRootHex,
        blockHeight: 0,
        type: GroupType.ManyNouns,
      },
    });
  }

  // Only the tree nodes of a single tree can exist in our database,
  // so we delete all existing trees nodes to store a new set of tree nodes.
  await prisma.treeNode.deleteMany({});
  await prisma.treeNode.createMany({
    data: PRIV_KEYS.map((privKey, i) => {
      const merkleProof = tree.createProof(tree.indexOf(pubKeyHashes[i]));
      return {
        pubkey: `0x${privateToPublic(privKey).toString('hex')}`,
        path: merkleProof.siblings.map((sibling) => `${sibling.toString(16)}`),
        indices: merkleProof.pathIndices.map((index) => index.toString()),
        type: GroupType.ManyNouns,
      };
    }),
  });
  */

  log('...done!');
};

populateTestData();
