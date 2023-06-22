import type { NextApiRequest, NextApiResponse } from 'next';
import { isNymValid, selectAndCleanPosts } from '../../utils';
import { IPostPreview } from '@/types/api';
import { isAddress } from 'viem';

// Return posts as specified by the query parameters
const handleGetUserPosts = async (
  req: NextApiRequest,
  res: NextApiResponse<IPostPreview[] | { error: string }>,
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

  const posts = await selectAndCleanPosts({ userId, skip, take });
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
