import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import { isNymValid } from '../../utils';
import { IUserPost, userPostsSelect } from '@/types/api';
import { isAddress } from 'viem';

// Return posts as specified by the query parameters
const handleGetUserPosts = async (
  req: NextApiRequest,
  res: NextApiResponse<IUserPost[] | { error: string }>,
) => {
  const userId = req.query.userId as string;

  // Determine if `user` is a nym or an ETH address by using a regex to identify ETH addresses.
  const isNym = !isAddress(userId);
  const skip = req.query.offset ? parseInt(req.query.offset as string) : undefined;
  const take = req.query.limit ? parseInt(req.query.limit as string) : undefined;

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
      userId: isNym ? userId : userId.toLowerCase(),
    },
    skip,
    take,
  });

  // Format the data returned from the database
  const posts = postsRaw.map((post) => {
    const { _count, ...restPost } = post;
    return {
      ...restPost,
      replyCount: post._count.descendants,
    };
  });

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
