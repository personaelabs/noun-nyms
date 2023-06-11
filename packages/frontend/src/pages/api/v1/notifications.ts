import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import { postPreviewSelect, userUpvotesSelect } from '@/types/api';
import { RawNotifications } from '@/types/api';

const handleGetNotificationFeed = async (
  req: NextApiRequest,
  res: NextApiResponse<RawNotifications>,
) => {
  const startTime = req.query.startTime ? (req.query.startTime as string) : new Date(0);
  const endTime = req.query.endTime ? (req.query.endTime as string) : new Date();

  const posts = await prisma.post.findMany({
    select: postPreviewSelect,
    where: {
      timestamp: {
        gt: startTime,
        lte: endTime,
      },
    },
    orderBy: {
      timestamp: 'desc',
    },
  });

  const upvotes = await prisma.doxedUpvote.findMany({
    select: userUpvotesSelect,
    where: {
      timestamp: {
        gt: startTime,
        lte: endTime,
      },
    },
    orderBy: {
      timestamp: 'desc',
    },
  });

  const result = { posts, upvotes };

  res.send(result);
};

// Entry point for the API below /api/v1/posts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method == 'GET') {
    await handleGetNotificationFeed(req, res);
  } else {
    res.status(400).send('Unsupported method');
  }
}
