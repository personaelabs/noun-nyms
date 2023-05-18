import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import { IUserUpvote, userUpvotesSelect } from '@/types/api/userUpvotesSelect';

const handleGetUserUpvotes = async (
  req: NextApiRequest,
  res: NextApiResponse<IUserUpvote[] | { error: string }>,
) => {
  const userId = req.query.userId as string;
  const isETHAddress = /^0x[0-9a-fA-F]{40}$/.test(userId);

  if (!isETHAddress) {
    res.status(400).send({ error: 'a non-ETH address was provided' });
    return;
  }

  const skip = req.query.offset ? parseInt(req.query.offset as string) : undefined;
  const take = req.query.limit ? parseInt(req.query.limit as string) : undefined;

  const upvotesRaw = await prisma.doxedUpvote.findMany({
    select: userUpvotesSelect,
    orderBy: {
      timestamp: 'desc',
    },
    where: {
      address: userId.toLowerCase(),
    },
    skip,
    take,
  });

  const upvotes = upvotesRaw.map((upvote) => {
    const { post, ...restUpvote } = upvote;
    const { _count, ...restPost } = post;
    return {
      ...restUpvote,
      post: {
        ...restPost,
        replyCount: _count.descendants,
      },
    };
  });
  // @ts-expect-error Upvotes doesn't like replyCount
  res.send(upvotes);
};

// Entry point for the API below /api/v1/users/{user}/upvotes
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method == 'GET') {
    await handleGetUserUpvotes(req, res);
  } else {
    res.status(400).send('Unsupported method');
  }
}
