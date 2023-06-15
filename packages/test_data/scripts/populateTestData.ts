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
import * as fs from 'fs';
import csvParser from 'csv-parser';
import DEV_ACCOUNTS from '../../../dev-accounts.json';

type CachedEOA = {
  address: string;
  pubkey: string;
};

const readFile = (filePath: string): Promise<CachedEOA[]> =>
  new Promise((resolve, reject) => {
    const result: CachedEOA[] = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row: any) => {
        result.push(row);
      })
      .on('end', () => {
        resolve(result);
      })
      .on('error', () => {
        reject();
      });
  });

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

const DEV_PUBKEYS = DEV_ACCOUNTS.map((account) => Buffer.from(account.pubKey, 'hex'));

// Sanity check
for (let i = 0; i < DEV_ACCOUNTS.length; i++) {
  const address = DEV_ACCOUNTS[i].address.toLowerCase();
  const pubKey = DEV_PUBKEYS[i];
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

  // Get the pub key hashes of the nouners
  const nouners = await readFile(path.join(__dirname, '../../../cache/cached-eoas.csv'));

  for (let i = 0; i < nouners.length; i++) {
    const nouner = nouners[i];
    pubKeyHashes.push(poseidon.hashPubKey(Buffer.from(nouner.pubkey.replace('0x', ''), 'hex')));
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
        root: treeRootHex,
        address: `0x${privateToAddress(privKey).toString('hex')}`,
        pubkey: `0x${privateToPublic(privKey).toString('hex')}`,
        path: merkleProof.siblings.map((sibling) => `${sibling[0].toString()}`),
        indices: merkleProof.pathIndices.map((index) => index.toString()),
        type: GroupType.OneNoun,
      };
    }),

    ...DEV_PUBKEYS.map((pubKey, i) => {
      const merkleProof = tree.createProof(tree.indexOf(pubKeyHashes[PRIV_KEYS.length + i]));
      return {
        root: treeRootHex,
        address: `0x${pubToAddress(pubKey).toString('hex')}`,
        pubkey: `0x${pubKey.toString('hex')}`,
        path: merkleProof.siblings.map((sibling) => `${sibling.toString()}`),
        indices: merkleProof.pathIndices.map((index) => index.toString()),
        type: GroupType.OneNoun,
      };
    }),

    ...nouners.map((nouner, i) => {
      const merkleProof = tree.createProof(
        tree.indexOf(pubKeyHashes[DEV_PUBKEYS.length + PRIV_KEYS.length + i]),
      );
      return {
        root: treeRootHex,
        address: nouner.address,
        pubkey: nouner.pubkey,
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
