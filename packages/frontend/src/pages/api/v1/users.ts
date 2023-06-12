import prisma from '@/lib/prisma';
import { UserPostCounts } from '@/types/api';
import { NextApiRequest, NextApiResponse } from 'next';
import { isAddress } from 'viem';

function countUpvotes(
  users: {
    userId: string;
    _count: {
      upvotes: number;
    };
  }[],
) {
  const upvotesCount: { [userId: string]: number } = {};

  users.forEach((user) => {
    const { userId, _count } = user;
    const { upvotes } = _count;

    if (!upvotesCount[userId]) {
      upvotesCount[userId] = 0;
    }

    upvotesCount[userId] += upvotes;
  });

  return upvotesCount;
}

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

  const upvotesRecevied = await prisma.post.findMany({
    select: {
      userId: true,
      _count: {
        select: {
          upvotes: true,
        },
      },
    },
  });

  const upvotesByUserId = countUpvotes(upvotesRecevied);

  const finalCounts = postCounts.map(({ userId, _count, _max }) => ({
    userId,
    numPosts: _count._all - _count.parentId,
    numReplies: _count.parentId,
    totalPosts: _count._all,
    doxed: isAddress(userId),
    lastActive: _max.timestamp,
    upvotes: userId in upvotesByUserId ? upvotesByUserId[userId] : 0,
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
