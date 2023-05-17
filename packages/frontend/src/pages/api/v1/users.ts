import prisma from '@/lib/prisma';
import { UserPostCounts } from '@/types/api';
import { NextApiRequest, NextApiResponse } from 'next';
import { isAddress } from 'viem';

interface UpvoteCount {
  [address: string]: number;
}
const getUpvoteCount = (userId: string, countObject: UpvoteCount) => {
  if (userId in countObject) return countObject[userId];
  else return 0;
};

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

  const upvoteCounts = await prisma.doxedUpvote.groupBy({
    by: ['address'],
    _count: { address: true },
  });

  const countsObject = upvoteCounts.reduce<UpvoteCount>((obj, item) => {
    const address = item.address;
    const count = item._count.address;
    obj[address] = count;
    return obj;
  }, {});

  const finalCounts = postCounts.map(({ userId, _count, _max }) => ({
    userId,
    numPosts: _count._all - _count.parentId,
    numReplies: _count.parentId,
    totalPosts: _count._all,
    doxed: isAddress(userId),
    lastActive: _max.timestamp,
    // Util to get human readable name for nym. Might want to get ens in the future as well.
    // not sure if best client or server side tho.
    name: isAddress(userId) ? userId : userId.split('-')[0],
    // Also not sure if we need to reduce to get upvote count.
    upvotes: isAddress(userId) ? getUpvoteCount(userId, countsObject) : 0,
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
