import prisma from '@/lib/prisma';
import { GroupType } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

// Return all members of a group
const handleGetLatestGroup = async (req: NextApiRequest, res: NextApiResponse) => {
  const set = req.query.set as string;

  if (set !== '1' && set !== '2') {
    res.status(400).send('Invalid set');
    return;
  }

  const type = set === '1' ? GroupType.OneNoun : GroupType.ManyNouns;

  const treeNodes = await prisma.treeNode.findMany({
    select: {
      pubkey: true,
      path: true,
      indices: true,
    },
    where: {
      type,
    },
    orderBy: {
      pubkey: 'asc',
    },
  });

  /*  
  if (treeNodes.length < 100) {
    res.status(503).send("Not enough members");
    return;
  }
  */

  const root = await prisma.tree.findFirst({
    select: {
      root: true,
    },
    where: {
      type,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  res.send({
    root: root?.root,
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
