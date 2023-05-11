import prisma from '../../../../../lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import { isNymValid } from '../../utils';
import { IUserPost, userPostsSelect } from '@/types/api';

// Return posts as specified by the query parameters
const handleGetUserPosts = async (
  req: NextApiRequest,
  res: NextApiResponse<IUserPost[] | { error: string }>,
) => {
  const userId = req.query.userId as string;

  // Determine if `user` is a nym or an ETH address by using a regex to identify ETH addresses.
  const isNym = /^0x[0-9a-fA-F]{40}$/.test(userId) ? false : true;

  const skip = req.query.offset ? parseInt(req.query.offset as string) : 0;
  const take = req.query.limit ? parseInt(req.query.limit as string) : 10;

  if (isNym && !isNymValid(userId)) {
    res.status(400).send({ error: 'Invalid nym format' });
    return;
  }

  const postsRaw = await prisma.post.findMany({
    select: userPostsSelect,
    orderBy: {
      timestamp: 'desc',
    },
    where: {
      userId: userId.replace('0x', ''),
    },
    skip,
    take,
  });

  // Format the data returned from the database
  const posts = postsRaw.map((post) => ({
    id: post.id,
    title: post.title,
    body: post.body,
    timestamp: post.timestamp,
    userId: post.userId,
    replyCount: post._count.descendants,
    upvotes: post.upvotes,
  }));

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
