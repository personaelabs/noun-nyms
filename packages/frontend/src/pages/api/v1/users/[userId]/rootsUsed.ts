import type { NextApiRequest, NextApiResponse } from 'next';
import { rootsUsedSelect, IRootsUsed } from '@/types/api';
import prisma from '@/lib/prisma';

// Return all group roots used by the user
const handleGetRootsUsed = async (
  req: NextApiRequest,
  // res: NextApiResponse<IRootsUsed | { error: string }>, // TODO: Figure out why IRootsUsed doesn't work here
  res: NextApiResponse<{ groupRoot: string }[] | { error: string }>, // TODO: Figure out why IRootsUsed doesn't work here
) => {
  const userId = req.query.userId as string;

  const roots = await prisma.post.groupBy({
    ...rootsUsedSelect,
    where: {
      userId,
    },
  });

  res.send(roots);
};

// Entry point for the API below /api/v1/users/{userId}/posts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method == 'GET') {
    await handleGetRootsUsed(req, res);
  } else {
    res.status(400).send('Unsupported method');
  }
}
