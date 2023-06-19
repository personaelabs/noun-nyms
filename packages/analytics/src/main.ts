import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BLOCK_TIME = 12; // seconds
const DAY_IN_SECONDS = 24 * 60 * 60;

const main = async () => {
  const startTree = await prisma.tree.findFirstOrThrow({
    orderBy: { blockHeight: "asc" }
  });
  const endTree = await prisma.tree.findFirstOrThrow({
    orderBy: { blockHeight: "desc" }
  });

  const startTreeNodes = await prisma.treeNode.findMany({
    where: {
      root: startTree.root
    }
  });

  const endTreeNodes = await prisma.treeNode.findMany({
    where: {
      root: endTree.root
    }
  });

  // Get the number of removed nodes
  const removedNodes = startTreeNodes.filter(startTreeNode => {
    return !endTreeNodes.some(
      endTreeNode => endTreeNode.address === startTreeNode.address
    );
  });

  const blockHeightDiff = endTree.blockHeight - startTree.blockHeight;
  const duration = ((blockHeightDiff * BLOCK_TIME) / DAY_IN_SECONDS).toFixed(2);
  const setSizeReductionPerBlock = removedNodes.length / blockHeightDiff;
  const setSizeReductionPerDay = (
    (setSizeReductionPerBlock / BLOCK_TIME) *
    DAY_IN_SECONDS
  ).toFixed(2);

  console.log(
    `From block ${startTree.blockHeight} to block ${endTree.blockHeight} (duration of ${duration} days), ${removedNodes.length} members were removed.`
  );
  console.log("Member reduction per day:", setSizeReductionPerDay);
};

main();
