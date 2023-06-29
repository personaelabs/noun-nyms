import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BLOCK_TIME = 12; // seconds
const DAY_IN_SECONDS = 24 * 60 * 60;

// Get the delta of the oldest set and the latest set,
// and calculate the speed of the pseudonymity set size reduction.
const main = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("env var DATABASE_URL is not set");
  }

  // Get the oldest and latest trees
  const oldestTree = await prisma.tree.findFirstOrThrow({
    orderBy: { blockHeight: "asc" }
  });
  const latestTree = await prisma.tree.findFirstOrThrow({
    orderBy: { blockHeight: "desc" }
  });
  const oldestTreeNodes = await prisma.treeNode.findMany({
    where: {
      root: oldestTree.root
    }
  });
  const latestTreeNodes = await prisma.treeNode.findMany({
    where: {
      root: latestTree.root
    }
  });

  // Get the set of addresses in the oldest and latest trees
  const oldestSet = oldestTreeNodes.map(node => node.address);
  const latestSet = latestTreeNodes.map(node => node.address);

  // Get the set of removed addresses
  const deltaSet = oldestSet.filter(address => !latestSet.includes(address));

  // Calculate the speed of the pseudonymity set size reduction
  const blockHeightDiff = latestTree.blockHeight - oldestTree.blockHeight;
  const duration = ((blockHeightDiff * BLOCK_TIME) / DAY_IN_SECONDS).toFixed(2);
  const setSizeReductionPerBlock = deltaSet.length / blockHeightDiff;
  const setSizeReductionPerDay = (
    (setSizeReductionPerBlock / BLOCK_TIME) *
    DAY_IN_SECONDS
  ).toFixed(2);

  // Print the result
  console.log(
    `From block ${oldestTree.blockHeight} to block ${latestTree.blockHeight} (duration of ${duration} days), ${deltaSet.length} members were removed.`
  );
  console.log(`Removed members:`);
  for (let i = 0; i < deltaSet.length; i++) {
    console.log(deltaSet[i]);
  }
  console.log("Member reduction per day:", setSizeReductionPerDay);
  console.log(
    `Pseudonymity set size reduced from ${oldestSet.length} to ${
      oldestSet.length - deltaSet.length
    }`
  );
};

main();
