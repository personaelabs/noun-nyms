// TODO: Prisma group by query that performs user stats based on group by + count.
/**
 * End goal is data like:
 * {
 *  userId:
 *  numPosts:
 *  numUpvotes:
 *  timeLastActive:
 *  numReplies:
 * }
 */

import prisma from '@/lib/prisma';
import { UserPostCounts } from '@/types/api';
import { NextApiRequest, NextApiResponse } from 'next';

const handleGetUsers = async (req: NextApiRequest, res: NextApiResponse<UserPostCounts[]>) => {
  const postCounts = await prisma.post.groupBy({
    by: ['userId'],
    _count: {
      _all: true,
      parentId: true,
    },
    _max: {
      timestamp: true,
    },
  });

  const finalCounts = postCounts.map(({ userId, _count, _max }) => ({
    userId,
    numPosts: _count._all - _count.parentId,
    numReplies: _count.parentId,
    totalPosts: _count._all,
    doxed: /^0x[0-9a-fA-F]{40}$/.test(userId),
    lastActive: _max.timestamp,
  }));

  res.send(finalCounts);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method == 'GET') {
    await handleGetUsers(req, res);
  } else {
    res.status(400).send('Unsupported method');
  }
}
