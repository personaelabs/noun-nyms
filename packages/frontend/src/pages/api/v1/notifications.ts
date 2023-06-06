import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import { postPreviewSelect, IPostPreview } from '@/types/api';

const handleGetNotificationFeed = async (
  req: NextApiRequest,
  res: NextApiResponse<IPostPreview[]>,
) => {
  const startTime = req.query.startTime ? (req.query.startTime as string) : new Date(0);
  const endTime = req.query.endTime ? (req.query.endTime as string) : new Date();

  console.log({ startTime, endTime });
  const feed = await prisma.post.findMany({
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
