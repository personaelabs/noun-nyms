import prisma from '../../../../../lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

const handleGetUserUpvotes = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = req.query.userId as string;
  const isETHAddress = /^0x[0-9a-fA-F]{40}$/.test(userId);

  if (!isETHAddress) {
    res.status(400).send({ error: 'a non-ETH address was provided' });
    return;
  }

  const skip = req.query.offset ? parseInt(req.query.offset as string) : 0;
  const take = req.query.limit ? parseInt(req.query.limit as string) : 10;

  const posts = await prisma.doxedUpvote.findMany({
    select: {
      id: true,
      postId: true,
      address: true,
      timestamp: true,
    },
    orderBy: {
      timestamp: 'desc',
    },
    where: {
      address: userId,
    },
    skip,
    take,
  });

  res.send(posts);
};

// Entry point for the API below /api/v1/users/{user}/upvotes
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method == 'GET') {
    await handleGetUserUpvotes(req, res);
  } else {
    res.status(400).send('Unsupported method');
  }
}
