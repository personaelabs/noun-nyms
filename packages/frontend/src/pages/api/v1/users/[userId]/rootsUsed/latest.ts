import type { NextApiRequest, NextApiResponse } from 'next';
import { latestRootUsedSelect, groupSelect, IGroup } from '@/types/api';
import prisma from '@/lib/prisma';

// Return the latest group root used by the user
const handleGetLatestRootUsed = async (
  req: NextApiRequest,
  res: NextApiResponse<{ root: string; members: IGroup[] } | { error: string }>,
) => {
  const userId = req.query.userId as string;

  const root = await prisma.post.findFirst({
    select: {
      ...latestRootUsedSelect,
    },
    where: {
      userId,
    },
    orderBy: {
      timestamp: 'desc',
    },
  });

  if (!root) {
    res.status(404).send({ error: 'No post found' });
    return;
  }

  const group = await prisma.treeNode.findMany({
    select: groupSelect,
    where: {
      root: root.groupRoot,
    },
  });

  res.send({
    root: root.groupRoot,
    members: group,
  });
};

// Entry point for the API below /api/v1/users/{userId}/posts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method == 'GET') {
    await handleGetLatestRootUsed(req, res);
  } else {
    res.status(400).send('Unsupported method');
  }
}
