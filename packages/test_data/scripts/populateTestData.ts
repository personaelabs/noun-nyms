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
  Post,
} from '@personaelabs/nymjs';
import { Poseidon, Tree } from '@personaelabs/spartan-ecdsa';

type DoxedPostExt = {
  upvotes: number;
} & DoxedPost;

type NymPostExt = {
  upvotes: number;
} & NymPost;

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

const log = (msg: string) => {
  process.stdout.write(`${msg}`);
};

const populateTestData = async () => {
  // ##############################
  // Create accounts.
  // We use the highest upvote count
  // to determine the number of accounts to create.
  // ##############################

  const flattenTestData = (data: TestData): TestData[] => {
    return [data, ...data.replies.map((reply) => flattenTestData(reply)).flat()];
  };

  const testDataFlat: TestData[] = testData.map(flattenTestData).flat();
  const maxUpvote = Math.max(...testDataFlat.map((data) => data.upvotes));

  const PRIV_KEYS = new Array(Math.max(maxUpvote, NYMS.length)).fill(0).map((_, i) => {
    return Buffer.from((i + 1).toString(16).padStart(64, '0'), 'hex');
  });

  // ##############################
  // Construct a tree that includes all accounts created above
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

  // ##############################
  // Create posts
  // ##############################

  const prover = new NymProver({
    circuitUrl: path.join(__dirname, './circuit_artifacts/nym_ownership.circuit'),
    witnessGenWasm: path.join(__dirname, './circuit_artifacts/nym_ownership.wasm'),
  });

  await prover.initWasm();

  const allPosts: (DoxedPostExt | NymPostExt)[] = [];

  // Format test data into Prisma type `DoxedPost`
  const createPost = async (
    title: string,
    body: string,
    upvotes: number,
    accountIndex: number,
    parentId: PrefixedHex,
    attestationScheme: AttestationScheme,
  ): Promise<DoxedPostExt | NymPostExt> => {
    const privKey = PRIV_KEYS[accountIndex];

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

    const contentSig = ecsign(typedContentHash, privKey);
    const contentSigStr = toCompactSig(contentSig.v, contentSig.r, contentSig.s);

    if (attestationScheme === AttestationScheme.Nym) {
      const nymCode = NYMS[accountIndex];
      const typedNymCode = toTypedNymCode(nymCode);
      const typedNymCodeHash = eip712MsgHash(
        typedNymCode.domain,
        typedNymCode.types,
        typedNymCode.value,
      );
      const nymSig = ecsign(typedNymCodeHash, privKey);
      const nymSigStr = toCompactSig(nymSig.v, nymSig.r, nymSig.s);
      const merkleProof = tree.createProof(tree.indexOf(pubKeyHashes[accountIndex]));

      const attestation = await prover.prove(
        nymCode,
        content,
        nymSigStr,
        contentSigStr,
        merkleProof,
      );
      const attestationHex = attestation.toString('hex');

      const post = toPost(content, attestation, AttestationScheme.Nym);

      return {
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
        upvotes,
      };
    } else {
      const post = toPost(content, contentSigStr, AttestationScheme.EIP712);

      return {
        id: post.id as string,
        title: post.content.title,
        body: post.content.body,
        timestamp: new Date(post.content.timestamp * 1000),
        parentId: post.content.parentId,
        venue: post.content.venue,
        groupRoot: post.content.groupRoot,
        sig: contentSigStr,
        address: privateToAddress(privKey).toString('hex'),
        hashScheme: HashScheme.Keccak256,
        createdAt: new Date(),
        updatedAt: new Date(),
        upvotes,
      };
    }
  };

  // Recursively create Primsa type `DoxedPost` from post and its replies
  const createPostWithReplies = async (
    parentId: PrefixedHex,
    data: TestData,
  ): Promise<(DoxedPostExt | NymPostExt)[]> => {
    const accountIndex = Math.floor(Math.random() * NYMS.length);
    const post = await createPost(
      data.title,
      data.body,
      data.upvotes,
      accountIndex,
      parentId,
      data.attestationScheme,
    );

    const replies = await Promise.all(
      data.replies.map((reply) => createPostWithReplies(post.id as PrefixedHex, reply)),
    );

    return [post, ...replies.flat()];
  };

  log('Preparing posts...');
  for (let i = 0; i < testData.length; i++) {
    const data = testData[i];

    allPosts.push(...(await createPostWithReplies('0x0', data)));
  }
  log('...done\n');

  log('Creating  upvotes...');
  const upvotes = [];
  for (let i = 0; i < allPosts.length; i++) {
    const post = allPosts[i];
    for (let j = 0; j < post.upvotes; j++) {
      const timestamp = Math.round(Date.now() / 1000);
      const signer = PRIV_KEYS[j];

      const typedUpvote = toTypedUpvote(post.id, timestamp, treeRootHex);
      const typedUpvoteHash = eip712MsgHash(
        typedUpvote.domain,
        typedUpvote.types,
        typedUpvote.value,
      );
      const { v, r, s } = ecsign(typedUpvoteHash, signer);
      const sig = toCompactSig(v, r, s);

      const upvote = toUpvote(post.id as PrefixedHex, treeRootHex, timestamp, sig);

      upvotes.push({
        id: upvote.id,
        postId: upvote.postId,
        groupRoot: treeRootHex,
        sig,
        address: privateToAddress(signer).toString('hex'),
        timestamp: new Date(upvote.timestamp * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  log('...done\n');

  // ##############################
  // Save everything to the database
  // ##############################
  log('Saving to database...');

  // Save doxed posts to the database

  const doxedPosts = allPosts
    .filter((post) => (post as DoxedPost).sig)
    .map(({ upvotes, ...post }) => post) as DoxedPost[];

  await prisma.doxedPost.createMany({
    // We only store newly added posts
    data: doxedPosts,
  });

  // Save nym posts to the database
  const nymPosts = allPosts
    .filter((post) => (post as NymPost).fullProof)
    .map(({ upvotes, ...post }) => post) as NymPost[];

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

  log('...done!\n\n');

  log(`Created: \n`);
  log(`- ${doxedPosts.length} Doxed posts\n`);
  log(`- ${nymPosts.length} Nym posts\n`);
  log(`- ${upvotes.length} total upvotes\n`);
  log(`\n`);
};

populateTestData();
