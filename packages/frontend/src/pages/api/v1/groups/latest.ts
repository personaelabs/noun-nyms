import prisma from '@/lib/prisma';
import { GroupType } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

// Return all members of a group
const handleGetLatestGroup = async (req: NextApiRequest, res: NextApiResponse) => {
  const latestTree = await prisma.tree.findFirst({
    select: {
      root: true,
    },
    where: {
      // For now, we only support the OneNoun group
      type: GroupType.OneNoun,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!latestTree) {
    res.status(404).send('No tree found');
    return;
  }

  const treeNodes = await prisma.treeNode.findMany({
    select: {
      address: true,
      pubkey: true,
      path: true,
      indices: true,
    },
    where: {
      root: latestTree.root,
    },
    orderBy: {
      pubkey: 'asc',
    },
  });

  res.send({
    root: latestTree.root,
    members: treeNodes,
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method == 'GET') {
    await handleGetLatestGroup(req, res);
  } else {
    res.status(400).send('Unsupported method');
  }
}
