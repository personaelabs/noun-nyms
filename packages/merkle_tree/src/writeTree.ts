import "dotenv/config";
import { executeQuery, buildDelegatesQuery, buildOwnersQuery } from "./graphql";
import { Account as Owner, Delegate } from "../.graphclient";
import { getOwners } from "./multisig";
import { Poseidon, Tree } from "@personaelabs/spartan-ecdsa";
import { getPubkey } from "./pubkey";

import { PrismaClient, GroupType } from "@prisma/client";
import alchemy from "./alchemy";
const prisma = new PrismaClient();
const poseidon = new Poseidon();

type DevAccount = {
  id: string;
  tokenBalance: number;
};

type EOA = {
  address: string;
  tokenBalance: number | null;
  delegatedVotes: number | null;
  pubKey: Buffer;
};

type AccountCode = {
  address: string;
  code: string;
};

const DEV_ACCOUNT = {
  address: "57628b342f1cffbe5cf6cdd8ebf6ea0bb9176ea4",
  pubKey: Buffer.from(
    "73703d822b3a4bf694d7c29e9200e6e20ba00068a33886cb393a7a908012e1b3fd9467081aa964663cb75e399fa545ba1932dbebae97da9fdd841994df77e69c",
    "hex"
  ),
  tokenBalance: 2,
  delegatedVotes: null
};

let poseidonInitialized = false;

// Return true if the account has more than 1 token balance or delegated votes
const isManyNounsAccount = (account: EOA): boolean =>
  (account.tokenBalance !== null && account.tokenBalance >= 2) ||
  (account.delegatedVotes !== null && account.delegatedVotes >= 2);

// Return true if the root already exists in the database
const treeExists = async (root: string): Promise<boolean> =>
  (await prisma.tree.findFirst({
    where: {
      root
    }
  }))
    ? true
    : false;

// Write the public key tree constructed at the given block height to the database
export async function createTree(blockHeight: number): Promise<{
  set1Tree: Tree;
  set2Tree: Tree;
  set1PubKeys: Buffer[];
  set2PubKeys: Buffer[];
}> {
  console.log("Writing tree to database at block", blockHeight);
  // ########################################################
  // Fetch owners and delegates from the The Graph
  // ########################################################

  console.time("Fetch owners and delegates from subgraph");
  const owners: Owner[] = (await executeQuery(buildOwnersQuery(blockHeight)))
    .accounts;
  const delegates: Delegate[] = (
    await executeQuery(buildDelegatesQuery(blockHeight))
  ).delegates;
  console.timeEnd("Fetch owners and delegates from subgraph");

  const accounts: (Owner | Delegate | DevAccount)[] = owners;

  // Add delegates to the list of all accounts if they are not already there
  for (let i = 0; i < delegates.length; i++) {
    if (!accounts.find(account => account.id === delegates[i].id)) {
      accounts.push(delegates[i]);
    }
  }

  // Load cached accounts from the database
  const cachedAccounts = await prisma.cachedEOA.findMany();
  const cachedCode = await prisma.cachedCode.findMany();

  let numNoPubKeySet1 = 0;
  let numNoPubKeySet2 = 0;
  const allAccounts: EOA[] = [];
  const accountCodes: AccountCode[] = [];

  console.time("Get pubkeys and multisig guardians");
  for (let i = 0; i < accounts.length; i++) {
    console.log(`Processing account ${i + 1} of ${accounts.length}`);
    const account = accounts[i];
    const address = account.id.replace("0x", ""); // Lowercase

    // Search address code from the database
    let code = cachedCode.find(cached => cached.address === address)?.code;

    // Fetch the code from Alchemy if not yet cached in the database
    if (!code) {
      code = await alchemy.core.getCode(address);
    }

    // Add the code to the list of all codes to cache it later
    accountCodes.push({
      address,
      code
    });

    // If the address is a multisig wallet, fetch the owners
    if (code !== "0x") {
      // Get owners that are not yet in the allAccounts array.
      // We do this because some addresses might have been already processed
      // since there are cases where a Noun owner/delegate is also a owner of a multisig wallet.
      const owners = (await getOwners(address)).filter(
        owner => !allAccounts.find(a => a.address === owner)
      ); // Lowercase

      for (let j = 0; j < owners.length; j++) {
        // Get the public key of the owner

        // Check cache
        let ownerPubKey;
        const ownerAccount = cachedAccounts.find(
          cachedAccount => cachedAccount.address === owners[j]
        );

        if (ownerAccount) {
          ownerPubKey = Buffer.from(
            BigInt("0x" + ownerAccount.pubkey).toString(16),
            "hex"
          );
        } else {
          // No cache, extract from a past transaction
          ownerPubKey = await getPubkey(owners[j], blockHeight);
        }

        if (ownerPubKey) {
          // Public key found!
          allAccounts.push({
            address: owners[j],
            tokenBalance: (account as Owner).tokenBalance || null,
            delegatedVotes: (account as Delegate).delegatedVotes || null,
            pubKey: ownerPubKey
          });
        } else {
          // Public key not found
          if (
            (account as Owner).tokenBalance >= 2 ||
            (account as Delegate).delegatedVotes >= 2
          ) {
            numNoPubKeySet2++;
          } else {
            numNoPubKeySet1++;
          }
        }
      }
      // Only process the address if it has not been processed yet
      // The address might have been processed since there are cases
      // where a Noun owner is also a delegate/owner of a multisig wallet
    } else if (!allAccounts.find(a => a.address === address)) {
      // Get the public key of the address

      // Check cache
      const cachedAccount = cachedAccounts.find(
        cached => cached.address === address
      );

      let pubKey;
      if (cachedAccount) {
        pubKey = Buffer.from(
          BigInt("0x" + cachedAccount.pubkey).toString(16),
          "hex"
        );
      } else {
        // No cache, extract from a past transaction
        pubKey = await getPubkey(address, blockHeight);
      }

      if (pubKey) {
        // Public key found!
        allAccounts.push({
          address,
          tokenBalance: (account as Owner).tokenBalance || null,
          delegatedVotes: (account as Delegate).delegatedVotes || null,
          pubKey
        });
      } else {
        // Public key not found
        if (
          (account as Owner).tokenBalance >= 2 ||
          (account as Delegate).delegatedVotes >= 2
        ) {
          numNoPubKeySet2++;
        } else {
          numNoPubKeySet1++;
        }
      }
    }
  }
  // Add the dev account
  allAccounts.push(DEV_ACCOUNT);

  console.timeEnd("Get pubkeys and multisig guardians");

  // ########################################################
  // Cache newly detected accounts and multisigs
  // ########################################################

  const newAccounts = allAccounts.filter(
    account =>
      !cachedAccounts.find(cached => cached.address === account.address)
  );

  await prisma.cachedEOA.createMany({
    data: newAccounts.map(account => ({
      address: account.address,
      pubkey: account.pubKey.toString("hex")
    }))
  });

  const newAccountCodes = accountCodes.filter(
    account => !cachedCode.find(cached => cached.address === account.address)
  );

  console.log(`Caching ${newAccountCodes.length} new account codes`);

  await prisma.cachedCode.createMany({
    data: newAccountCodes.map(accountCode => ({
      address: accountCode.address,
      code: accountCode.code
    }))
  });

  // ########################################################
  // Create the pubkey trees
  // ########################################################

  const sortedAccounts = allAccounts.sort((a, b) =>
    b.pubKey.toString("hex") > a.pubKey.toString("hex") ? -1 : 1
  );

  const anonSet1 = sortedAccounts;
  const anonSet2 = sortedAccounts.filter(account =>
    isManyNounsAccount(account)
  );

  const anonSet1PubKeys = anonSet1.map(account => account.pubKey);
  const anonSet2PubKeys = anonSet2.map(account => account.pubKey);

  if (!poseidonInitialized) {
    await poseidon.initWasm();
    poseidonInitialized = true;
  }

  const treeDepth = 20; // Spartan-ecdsa only supports tree depth = 20
  const anonSet1Tree = new Tree(treeDepth, poseidon);
  const anonSet2Tree = new Tree(treeDepth, poseidon);

  console.log("Creating Merkle tree... (Noun = 1)");
  console.time("Create Merkle tree (Noun = 1)");
  for (let i = 0; i < anonSet1.length; i++) {
    const hashedPubKey = poseidon.hashPubKey(anonSet1PubKeys[i]);
    anonSet1Tree.insert(hashedPubKey);
  }
  console.timeEnd("Create Merkle tree (Noun = 1)");

  console.log("Creating Merkle tree... (Noun > 1)");
  console.time("Create Merkle tree (Noun > 1)");
  for (let i = 0; i < anonSet2.length; i++) {
    const hashedPubKey = poseidon.hashPubKey(anonSet2PubKeys[i]);
    anonSet2Tree.insert(hashedPubKey);
  }
  console.timeEnd("Create Merkle tree (Noun > 1)");

  console.log(
    `Noun = 1 set size ${anonSet1.length}, ${numNoPubKeySet1} missing public keys`
  );
  console.log(
    `Noun > 1 set size ${anonSet2.length}, ${numNoPubKeySet2} missing public keys`
  );

  return {
    set1Tree: anonSet1Tree,
    set2Tree: anonSet2Tree,
    set1PubKeys: anonSet1PubKeys,
    set2PubKeys: anonSet2PubKeys
  };
}

const writeTree = async (
  anonSet1Tree: Tree,
  anonSet2Tree: Tree,
  anonSet1PubKeys: Buffer[],
  anonSet2PubKeys: Buffer[],
  blockHeight: number
) => {
  const anonSet1Root = anonSet1Tree.root().toString(16);
  const anonSet2Root = anonSet2Tree.root().toString(16);

  // Write only if the tree is new
  if (!(await treeExists(anonSet1Root))) {
    console.log("Creating new tree for set Noun = 1");
    await prisma.tree.create({
      data: {
        type: GroupType.OneNoun,
        blockHeight,
        root: anonSet1Root
      }
    });

    await prisma.treeNode.deleteMany({
      where: {
        type: GroupType.OneNoun
      }
    });

    await prisma.treeNode.createMany({
      data: anonSet1PubKeys.map(pubKey => {
        const index = anonSet1Tree.indexOf(poseidon.hashPubKey(pubKey));
        const merkleProof = anonSet1Tree.createProof(index);
        return {
          pubkey: pubKey.toString("hex"),
          path: merkleProof.siblings.map(s => BigInt(s).toString(16)),
          indices: merkleProof.pathIndices.map(i => i.toString()),
          type: GroupType.OneNoun
        };
      })
    });
  }

  // Write only if the tree is new
  if (!(await treeExists(anonSet2Root))) {
    console.log("Creating new tree for set Noun > 1");
    await prisma.tree.create({
      data: {
        type: GroupType.ManyNouns,
        blockHeight,
        root: anonSet2Root
      }
    });

    await prisma.treeNode.deleteMany({
      where: {
        type: GroupType.ManyNouns
      }
    });

    await prisma.treeNode.createMany({
      data: anonSet2PubKeys.map(pubKey => {
        const index = anonSet2Tree.indexOf(poseidon.hashPubKey(pubKey));
        const merkleProof = anonSet2Tree.createProof(index);
        return {
          pubkey: pubKey.toString("hex"),
          path: merkleProof.siblings.map(s => BigInt(s).toString(16)),
          indices: merkleProof.pathIndices.map(i => i.toString()),
          type: GroupType.ManyNouns
        };
      })
    });
  }
};

const run = async () => {
  const timerStart = Date.now();
  const blockHeight = await alchemy.core.getBlockNumber();
  const { set1Tree, set2Tree, set1PubKeys, set2PubKeys } = await createTree(
    blockHeight
  );
  await writeTree(set1Tree, set2Tree, set1PubKeys, set2PubKeys, blockHeight);
  const timerEnd = Date.now();

  const took = (timerEnd - timerStart) / 1000;
  console.log(`Done in ${took} seconds`);
};

run();
