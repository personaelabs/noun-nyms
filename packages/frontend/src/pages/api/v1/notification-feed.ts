import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import { INotificationFeed, notificationFeedSelect } from '@/types/api';

const handleGetNotificationFeed = async (
  req: NextApiRequest,
  res: NextApiResponse<INotificationFeed[]>,
) => {
  const feed = await prisma.post.findMany({
    select: notificationFeedSelect,
  });

  res.send(feed);
};

// Entry point for the API below /api/v1/posts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method == 'GET') {
    await handleGetNotificationFeed(req, res);
  } else {
    res.status(400).send('Unsupported method');
  }
}
