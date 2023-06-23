import prisma from '@/lib/prisma';
import { GroupType } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

// Return all members of a group
const handleGetGroup = async (req: NextApiRequest, res: NextApiResponse) => {
  const tree = await prisma.tree.findFirst({
    select: {
      root: true,
    },
    where: {
      // For now, we only support the OneNoun group
      type: GroupType.OneNoun,
      root: req.query.rootId as string,
    },
  });

  if (!tree) {
    res.status(404).send('Group not found');
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
      root: tree.root,
    },
    orderBy: {
      pubkey: 'asc',
    },
  });

  res.send({
    root: tree.root,
    members: treeNodes,
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method == 'GET') {
    await handleGetGroup(req, res);
  } else {
    res.status(400).send('Unsupported method');
  }
}
