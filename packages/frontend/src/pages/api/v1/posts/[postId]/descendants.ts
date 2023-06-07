import prisma from '@/lib/prisma';
import { IPostWDescendants, postDescendantsSelect } from '@/types/api';
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Goal: Given a post id, fetch it's root, then all of the descendants of the root.
 * and return some info about post Id
 */

// Return a single post and all of its replies till depth = 5
// TODO: Return all replies with a much higher depth limit
const handleGetPost = async (
  req: NextApiRequest,
  res: NextApiResponse<IPostWDescendants | { error: string }>,
) => {
  const id = req.query.postId as string;

  // If post is a root, we get it's descendants.
  // Otherwise, if post is not a root, we get descendants of it's root.
  const postWithReplies = await prisma.post.findFirst({
    select: postDescendantsSelect,
    where: {
      id,
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
