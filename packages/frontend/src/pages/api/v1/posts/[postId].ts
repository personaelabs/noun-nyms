import prisma from '@/lib/prisma';
import { postSelect, IPostWithReplies } from '@/types/api';
import type { NextApiRequest, NextApiResponse } from 'next';

// Return a single post and all of its replies till depth = 5
// TODO: Return all replies with a much higher depth limit
const handleGetPost = async (
  req: NextApiRequest,
  res: NextApiResponse<IPostWithReplies | { error: string }>,
) => {
  const postWithReplies = await prisma.post.findFirst({
    select: postSelect,
    where: {
      id: req.query.postId as string,
    },
  });

  if (!postWithReplies) {
    res.status(404).send({ error: 'Post not found' });
    return;
  }

  res.send(postWithReplies);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method == 'GET') {
    await handleGetPost(req, res);
  } else {
    res.status(400).send('Unsupported method');
  }
}
