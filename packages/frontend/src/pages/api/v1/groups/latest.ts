import prisma from '@/lib/prisma';
import {
  selectWithProofs,
  selectWithoutProofs,
  ITreeNodeWithProofs,
  ITreeNodeWithoutProofs,
} from '@/types/api/latestGroupSelect';
import { GroupType } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

// Return all members of a group
const handleGetLatestGroup = async (
  req: NextApiRequest,
  res: NextApiResponse<
    | {
        root: string;
        members: ITreeNodeWithProofs[] | ITreeNodeWithoutProofs[];
      }
    | {
        error: string;
      }
  >,
) => {
  const latestTree = await prisma.tree.findFirst({
    select: {
      root: true,
    },
    where: {
      // For now, we only support the OneNoun group
      type: GroupType.OneNoun,
    },
    orderBy: {
      blockHeight: 'desc',
    },
  });

  if (!latestTree) {
    res.status(404).send({ error: 'No tree found' });
    return;
  }

  const treeNodes = await prisma.treeNode.findMany({
    select: req.query.omitMerkleProofs === 'true' ? selectWithoutProofs : selectWithProofs,
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
