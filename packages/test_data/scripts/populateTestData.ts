import 'dotenv/config';
import * as path from 'path';
import { PrismaClient, NymPost, HashScheme, DoxedPost, GroupType } from '@prisma/client';
import testData from './testData';
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

  // We only create 10 Nym posts since generating proofs for them takes time
  const nymPostsTestData = testData.slice(0, 10);
  const doxedPostsTestData = testData.slice(10, testData.length);

  // ##############################
  // Create doxed posts
  // ##############################

  const doxedPosts: DoxedPost[] = [];

  process.stdout.write('Preparing dummy doxed posts...');
  for (let i = 0; i < doxedPostsTestData.length; i++) {
    const data = doxedPostsTestData[i];

    const nymIndex = i % PRIV_KEYS.length;
    const privKey = PRIV_KEYS[nymIndex];

    const parentId = i % 3 === 1 ? (doxedPosts[i - 1].id as PrefixedHex) : '0x0';

    const content: Content = {
      title: data.title,
      body: data.body,
      timestamp: data.timestamp as number,
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

    doxedPosts.push({
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
    });
  }
  process.stdout.write('...done\n');

  // ##############################
  // Create Nym posts
  // ##############################

  process.stdout.write('Preparing dummy Nym posts (this takes a bit)...');

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
      timestamp: data.timestamp as number,
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
  process.stdout.write('...done\n');

  // ##############################
  // Create upvotes
  // ##############################

  process.stdout.write('Creating dummy upvotes...');
  const upvotes = [...doxedPosts, ...nymPosts]
    // No upvotes for every 4 posts
    .filter((_, i) => i % 4 !== 0)
    .map((post, i) => {
      const timestamp = 1651683262;
      const typedUpvote = toTypedUpvote(post.id, timestamp, treeRootHex);
      const signer = PRIV_KEYS[i % PRIV_KEYS.length];

      const typedUpvoteHash = eip712MsgHash(
        typedUpvote.domain,
        typedUpvote.types,
        typedUpvote.value,
      );
      const { v, r, s } = ecsign(typedUpvoteHash, signer);
      const sig = toCompactSig(v, r, s);

      const upvote = toUpvote(post.id as PrefixedHex, treeRootHex, timestamp, sig);

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
  process.stdout.write('...done\n');

  process.stdout.write('Saving to database...');
  // ##############################
  // Save everything to the database
  // ##############################

  // Save the doxed posts to the database
  const doxedPostIdsInDB = (await prisma.doxedPost.findMany({})).map((doxedPost) => doxedPost.id);

  await prisma.doxedPost.createMany({
    // We only store newly added posts
    data: doxedPosts.filter((doxedPost) => !doxedPostIdsInDB.includes(doxedPost.id)),
  });

  const nymPostIdsInDB = (await prisma.nymPost.findMany({})).map((nymPost) => nymPost.id);

  // Save the nym posts to the database
  await prisma.nymPost.createMany({
    // We only store newly added posts
    data: nymPosts.filter((nymPost) => !nymPostIdsInDB.includes(nymPost.id)),
  });

  // Save the upvotes to the database
  const upvoteIdsInDB = (await prisma.doxedUpvote.findMany({})).map((upvote) => upvote.id);
  await prisma.doxedUpvote.createMany({
    // We only store newly added upvotes
    data: upvotes.filter((upvote) => !upvoteIdsInDB.includes(upvote.id)),
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

  process.stdout.write('...done!');
};

populateTestData();
