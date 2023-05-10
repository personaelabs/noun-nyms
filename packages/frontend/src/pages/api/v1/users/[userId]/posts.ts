import prisma from '../../../../../lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import { isNymValid } from '../../utils';

// Return posts as specified by the query parameters
const handleGetUserPosts = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = req.query.userId as string;

  // Determine if `user` is a nym or an ETH address by using a regex to identify ETH addresses.
  const isNym = /^0x[0-9a-fA-F]{40}$/.test(userId) ? false : true;

  const skip = req.query.offset ? parseInt(req.query.offset as string) : 0;
  const take = req.query.limit ? parseInt(req.query.limit as string) : 10;

  let posts;
  if (isNym) {
    const nym = userId;
    if (!isNymValid(nym)) {
      res.status(400).send({ error: 'Invalid nym format' });
      return;
    }

    posts = await prisma.nymPost.findMany({
      select: {
        id: true,
        title: true,
        nym: true,
        body: true,
        parentId: true,
        timestamp: true,
        upvotes: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
      where: {
        nym,
      },
      skip,
      take,
    });
  } else {
    posts = await prisma.doxedPost.findMany({
      select: {
        id: true,
        title: true,
        body: true,
        parentId: true,
        address: true,
        createdAt: true,
        timestamp: true,
        upvotes: true,
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
  }

  res.send(posts);
};

// Entry point for the API below /api/v1/users/{userId}/posts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method == 'GET') {
    await handleGetUserPosts(req, res);
  } else {
    res.status(400).send('Unsupported method');
  }
}
