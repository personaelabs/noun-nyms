// Since proofs rely on an RNG,
// test data populated by this script is NOT deterministic.

// Following the non-deterministic nature of proofs,
// data that aren’t related to proofs are
// also internally made non-deterministic (by using `Date.now()` to sample the timestamp).

import 'dotenv/config';
import * as path from 'path';
import {
  PrismaClient,
  Post as PrismaPost,
  HashScheme,
  AttestationScheme as PrismaAttestationScheme,
  GroupType,
} from '@prisma/client';
import testData, { TestData } from './testData';
import {
  ecsign,
  privateToAddress,
  privateToPublic,
  pubToAddress,
  toCompactSig,
} from '@ethereumjs/util';
import {
  AttestationScheme,
  Content,
  eip712MsgHash,
  toPost,
  toTypedContent,
  NymProver,
  toTypedNymName,
  toTypedUpvote,
  toUpvote,
  PrefixedHex,
  deserializeNymAttestation,
} from '@personaelabs/nymjs';
import { Poseidon, Tree } from '@personaelabs/spartan-ecdsa';

type PostExt = {
  upvotes: number;
} & PrismaPost;

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

const DEV_PUBKEYS = [
  // personaelabs.eth
  '37c6ebdcb07fe1e007aa748a9368fd96961aeceb291c2183541d1a5b8c1ba65349000a7a69d17576f1fa65d728741f6e4b9dba9465073b1f99ec185c060a5f74',
  // cha0sg0d.eth
  '2e1869b4aa4611eff68043fb8bfecf9e58a6252cf3de6547167099a3124345c0372b2a0edc636444c0718b53c76da503e3619e82bb4f0e2e34cbc02a84ad18d3',
  // amirbolous.eth
  '3ba0d5397de63df8884014d446fd68318345f236cfe3f808ae879dedb471fdb2673e0be282cbf9a422333c36afa2b5e6dc815bbb40e9cd0dc7df5179759d1383',
  // dantehrani.eth
  '765b012d6340fd3baf3068e3e118a68a559b832af2d9ddd05585fedcf9f9c2a95a65f71708281d9e1517e28c3643fa932d7675a233d8cc4edc3440c10684cd95',
].map((pubKey) => Buffer.from(pubKey, 'hex'));

const DEV_ADDRESSES = [
  // personaelabs.eth
  '141b63D93DaF55bfb7F396eEe6114F3A5d4A90B2',
  // cha0sg0d.eth
  '3ff4EcB0D7A01235dcCD9fc59B0d4969Cb011032',
  // amirbolous.eth
  '926B47C42Ce6BC92242c080CF8fAFEd34a164017',
  // dantehrani.eth
  '400EA6522867456E988235675b9Cb5b1Cf5b79C8',
];

// Sanity check
for (let i = 0; i < DEV_PUBKEYS.length; i++) {
  const pubKey = DEV_PUBKEYS[i];
  const address = DEV_ADDRESSES[i].toLowerCase();
  if (pubToAddress(pubKey).toString('hex') !== address) {
    throw new Error(`Public key ${pubKey.toString('hex')} doesn't match the address ${address}`);
  }
}

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

  // Get the public key hashes of the signers
  const pubKeyHashes = PRIV_KEYS.map((privKey) => {
    return poseidon.hashPubKey(privateToPublic(privKey));
  });

  // Get the public key hashes of the dev accounts
  for (let i = 0; i < DEV_PUBKEYS.length; i++) {
    pubKeyHashes.push(poseidon.hashPubKey(DEV_PUBKEYS[i]));
  }

  // Insert all public key hashes into the tree
  for (let i = 0; i < pubKeyHashes.length; i++) {
    tree.insert(pubKeyHashes[i]);
  }

  const treeRootHex: PrefixedHex = `0x${tree.root().toString(16)}`;

  // ##############################
  // Create posts
  // ##############################

  const prover = new NymProver({
    circuitUrl: path.join(__dirname, './circuit_artifacts/nym_ownership.circuit'),
    witnessGenWasm: path.join(__dirname, './circuit_artifacts/nym_ownership.wasm'),
  });

  await prover.initWasm();

  const allPosts: PostExt[] = [];

  // Format test data into Prisma type `Post`
  const createPost = async (
    title: string,
    body: string,
    upvotes: number,
    accountIndex: number,
    parentId: string | null,
    rootId: string | null,
    depth: number,
    attestationScheme: AttestationScheme,
  ): Promise<PostExt> => {
    const privKey = PRIV_KEYS[accountIndex];

    const content: Content = {
      title: title,
      body: body,
      timestamp: Math.round(Date.now() / 1000),
      parentId: (parentId ? parentId : '0x0') as PrefixedHex,
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
      const nymName = NYMS[accountIndex];
      const typedNymName = toTypedNymName(nymName);
      const typedNymNameHash = eip712MsgHash(
        typedNymName.domain,
        typedNymName.types,
        typedNymName.value,
      );
      const nymSig = ecsign(typedNymNameHash, privKey);
      const nymSigStr = toCompactSig(nymSig.v, nymSig.r, nymSig.s);
      const merkleProof = tree.createProof(tree.indexOf(pubKeyHashes[accountIndex]));

      const attestation = await prover.prove(
        nymName,
        content,
        nymSigStr,
        contentSigStr,
        merkleProof,
      );
      const attestationHex = `0x${attestation.toString('hex')}`;

      const post = toPost(content, attestation, AttestationScheme.Nym);
      const { publicInput } = deserializeNymAttestation(attestation);
      const nym = `${nymName}-${publicInput.nymHash.toString(16)}`;

      return {
        id: post.id,
        rootId,
        venue: post.content.venue,
        title: post.content.title,
        body: post.content.body,
        parentId,
        groupRoot: post.content.groupRoot,
        timestamp: new Date(post.content.timestamp * 1000),
        attestation: attestationHex,
        attestationScheme: PrismaAttestationScheme.Nym,
        hashScheme: HashScheme.Keccak256,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: nym,
        upvotes,
        depth,
      };
    } else {
      const post = toPost(content, contentSigStr, AttestationScheme.EIP712);

      return {
        id: post.id as string,
        rootId,
        title: post.content.title,
        body: post.content.body,
        timestamp: new Date(post.content.timestamp * 1000),
        parentId,
        venue: post.content.venue,
        groupRoot: post.content.groupRoot,
        attestation: contentSigStr,
        userId: `0x${privateToAddress(privKey).toString('hex')}`,
        attestationScheme: PrismaAttestationScheme.EIP712,
        hashScheme: HashScheme.Keccak256,
        createdAt: new Date(),
        updatedAt: new Date(),
        upvotes,
        depth,
      };
    }
  };

  // Recursively create Primsa type `Post` from post and its replies
  const createPostWithReplies = async (
    rootId: string | null,
    parentId: string | null,
    depth: number,
    data: TestData,
    isRoot: boolean,
  ): Promise<PostExt[]> => {
    const accountIndex = Math.floor(Math.random() * NYMS.length);

    const post = await createPost(
      data.title,
      data.body,
      data.upvotes,
      accountIndex,
      parentId,
      rootId,
      depth,
      data.attestationScheme,
    );

    const replies = await Promise.all(
      data.replies.map((reply) =>
        createPostWithReplies(
          isRoot ? (post.id as PrefixedHex) : rootId,
          post.id as PrefixedHex,
          depth + 1,
          reply,
          false,
        ),
      ),
    );

    return [post, ...replies.flat()];
  };

  log('Preparing posts...');
  for (let i = 0; i < testData.length; i++) {
    const data = testData[i];

    allPosts.push(...(await createPostWithReplies(null, null, 0, data, true)));
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
        address: `0x${privateToAddress(signer).toString('hex')}`,
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
        type: GroupType.OneNoun,
      },
    });
  }

  // Save all posts to the database
  const posts = allPosts.map(({ upvotes, ...post }) => post) as PrismaPost[];

  await prisma.post.createMany({
    // We only store newly added posts
    data: posts,
  });

  await prisma.doxedUpvote.createMany({
    data: upvotes,
  });

  // Only the tree nodes of a single tree can exist in our database,
  // so we delete all existing trees nodes to store a new set of tree nodes.
  await prisma.treeNode.deleteMany({});

  const treeNodes = [
    ...PRIV_KEYS.map((privKey, i) => {
      const merkleProof = tree.createProof(tree.indexOf(pubKeyHashes[i]));
      return {
        address: `0x${privateToAddress(privKey).toString('hex')}`,
        pubkey: `0x${privateToPublic(privKey).toString('hex')}`,
        path: merkleProof.siblings.map((sibling) => `${sibling.toString()}`),
        indices: merkleProof.pathIndices.map((index) => index.toString()),
        type: GroupType.OneNoun,
      };
    }),

    ...DEV_PUBKEYS.map((pubKey, i) => {
      const merkleProof = tree.createProof(tree.indexOf(pubKeyHashes[PRIV_KEYS.length + i]));
      return {
        address: `0x${pubToAddress(pubKey).toString('hex')}`,
        pubkey: `0x${pubKey.toString('hex')}`,
        path: merkleProof.siblings.map((sibling) => `${sibling.toString()}`),
        indices: merkleProof.pathIndices.map((index) => index.toString()),
        type: GroupType.OneNoun,
      };
    }),
  ];

  await prisma.treeNode.createMany({
    data: treeNodes,
  });

  log('...done!\n\n');

  log(`Created: \n`);
  log(`- ${allPosts.length} posts\n`);
  log(`- ${upvotes.length} total upvotes\n`);
  log(`\n`);
};

populateTestData();
