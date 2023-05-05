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
import * as fs from 'fs';
import csvParser from 'csv-parser';
import { Poseidon, Tree } from '@personaelabs/spartan-ecdsa';
import { treeExists } from './utils';

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

type TreeNodeSnapshot = {
  type: GroupType;
  pubkey: string;
};

const readTreeNodesSnapshot = (filePath: string): Promise<TreeNodeSnapshot[]> =>
  new Promise((resolve, reject) => {
    const result: TreeNodeSnapshot[] = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row: any) => {
        result.push({
          type: row.type,
          pubkey: row.pubkey,
        });
      })
      .on('end', () => {
        resolve(result);
      })
      .on('error', () => {
        reject();
      });
  });

const populateTestData = async () => {
  const timerStart = Date.now();

  // ##############################
  // Create dummy accounts.
  // We use the highest upvote count
  // to determine the number of accounts to create.
  // ##############################

  const flattenTestData = (data: TestData): TestData[] => {
    return [data, ...data.replies.map((reply) => flattenTestData(reply)).flat()];
  };

  const testDataFlat: TestData[] = testData.map(flattenTestData).flat();
  const maxUpvote = Math.max(...testDataFlat.map((data) => data.upvotes));

  const NUM_PRIV_KEYS = Math.max(maxUpvote, NYMS.length);

  // The private keys are just numbers incremented from 1.
  const PRIV_KEYS = new Array(NUM_PRIV_KEYS).fill(0).map((_, i) => {
    return Buffer.from((i + 1).toString(16).padStart(64, '0'), 'hex');
  });

  // ##############################
  // Construct a tree that includes a snapshot of the Noun owners set,
  // and the dummy accounts created above.
  // ##############################

  const poseidon = new Poseidon();
  await poseidon.initWasm();
  const treeOneNoun = new Tree(20, poseidon);
  const treeManyNouns = new Tree(20, poseidon);

  const pubKeysOneNoun: Buffer[] = [];
  const pubKeysManyNouns: Buffer[] = [];

  // Just add all the dummy accounts in the OneNoun group for now
  for (let i = 0; i < PRIV_KEYS.length; i++) {
    pubKeysOneNoun.push(privateToPublic(PRIV_KEYS[i]));
  }

  const treeNodesSnapshot = await readTreeNodesSnapshot(
    path.join(__dirname, './tree-snapshot-230505.csv'),
  );

  for (let i = 0; i < treeNodesSnapshot.length; i++) {
    const treeNode = treeNodesSnapshot[i];
    if (treeNode.type === GroupType.OneNoun) {
      pubKeysOneNoun.push(Buffer.from(treeNode.pubkey, 'hex'));
    } else if (treeNode.type === GroupType.ManyNouns) {
      pubKeysManyNouns.push(Buffer.from(treeNode.pubkey, 'hex'));
    } else {
      throw new Error(`Invalid group type ${treeNode.type}`);
    }
  }

  const pubKeyHashesOneNoun: bigint[] = pubKeysOneNoun.map((pubKey) => poseidon.hashPubKey(pubKey));
  const pubKeyHashesManyNouns: bigint[] = pubKeysManyNouns.map((pubKey) =>
    poseidon.hashPubKey(pubKey),
  );

  // Insert leaves to the tree of single noun owners
  for (let i = 0; i < pubKeyHashesOneNoun.length; i++) {
    treeOneNoun.insert(pubKeyHashesOneNoun[i]);
  }

  // Insert leaves to the tree of multiple noun owners
  for (let i = 0; i < pubKeyHashesManyNouns.length; i++) {
    treeManyNouns.insert(pubKeyHashesManyNouns[i]);
  }

  const treeRootOneNoun: PrefixedHex = `0x${treeOneNoun.root().toString(16)}`;
  const treeRootManyNouns: PrefixedHex = `0x${treeManyNouns.root().toString(16)}`;

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
      groupRoot: treeRootOneNoun,
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

      const pubKeyHash = poseidon.hashPubKey(privateToPublic(privKey));
      const merkleProof = treeOneNoun.createProof(treeOneNoun.indexOf(pubKeyHash));

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

      const typedUpvote = toTypedUpvote(post.id, timestamp, treeRootOneNoun);
      const typedUpvoteHash = eip712MsgHash(
        typedUpvote.domain,
        typedUpvote.types,
        typedUpvote.value,
      );
      const { v, r, s } = ecsign(typedUpvoteHash, signer);
      const sig = toCompactSig(v, r, s);

      const upvote = toUpvote(post.id as PrefixedHex, treeRootOneNoun, timestamp, sig);

      upvotes.push({
        id: upvote.id,
        postId: upvote.postId,
        groupRoot: treeRootOneNoun,
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

  // Save the trees to the database

  if (!(await treeExists(treeRootOneNoun))) {
    await prisma.tree.create({
      data: {
        root: treeRootOneNoun,
        blockHeight: 0,
        type: GroupType.OneNoun,
      },
    });
  }

  if (!(await treeExists(treeRootManyNouns))) {
    await prisma.tree.create({
      data: {
        root: treeRootManyNouns,
        blockHeight: 0,
        type: GroupType.ManyNouns,
      },
    });
  }

  // Only the tree nodes of a single tree can exist in our database,
  // so we delete all existing trees nodes to store a new set of tree nodes.

  await prisma.treeNode.deleteMany({});

  // Save the tree nodes of the one-noun tree to the database
  await prisma.treeNode.createMany({
    data: pubKeysOneNoun.map((pubKey, i) => {
      const merkleProof = treeOneNoun.createProof(treeOneNoun.indexOf(pubKeyHashesOneNoun[i]));
      return {
        pubkey: `0x${pubKey.toString('hex')}`,
        path: merkleProof.siblings.map((sibling) => `${sibling.toString(16)}`),
        indices: merkleProof.pathIndices.map((index) => index.toString()),
        type: GroupType.OneNoun,
      };
    }),
  });

  // Save the tree nodes of the many-nouns tree to the database
  await prisma.treeNode.createMany({
    data: pubKeysManyNouns.map((pubKey, i) => {
      const merkleProof = treeManyNouns.createProof(
        treeManyNouns.indexOf(pubKeyHashesManyNouns[i]),
      );
      return {
        pubkey: `0x${pubKey.toString('hex')}`,
        path: merkleProof.siblings.map((sibling) => `${sibling.toString(16)}`),
        indices: merkleProof.pathIndices.map((index) => index.toString()),
        type: GroupType.ManyNouns,
      };
    }),
  });

  // ##############################
  // Log some info about the test data created
  // ##############################

  log('...done!\n\n');

  log(`Created: \n`);
  log(`- ${doxedPosts.length} Doxed posts\n`);
  log(`- ${nymPosts.length} Nym posts\n`);
  log(`- ${upvotes.length} total upvotes\n`);
  log(`- OneNoun tree with ${pubKeysOneNoun.length} leaves\n`);
  log(`- ManyNouns tree with ${pubKeysManyNouns.length} leaves\n`);
  log(`\n`);

  const took = (Date.now() - timerStart) / 1000;
  log(`Done in ${took}s\n`);
};

populateTestData();
