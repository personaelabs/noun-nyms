import prisma from '@/lib/prisma';
import { postSelect, IPostWithReplies, postPreviewSelect } from '@/types/api';
import type { NextApiRequest, NextApiResponse } from 'next';

// Return a single post and all of its replies till depth = 5
// TODO: Return all replies with a much higher depth limit
const handleGetPost = async (
  req: NextApiRequest,
  res: NextApiResponse<IPostWithReplies | { error: string }>,
) => {
  const fromRoot = !!(req.query.fromRoot && req.query.fromRoot == 'true');

  // If fromRoot is true, we get the rootId of the given post
  let id = req.query.postId as string;
  // First get postPreview.
  if (fromRoot) {
    const postPreview = await prisma.post.findFirst({
      select: postPreviewSelect,
      where: {
        id,
      },
    });
    if (postPreview) {
      // Get the root id if it exists
      const { root, ...post } = postPreview;
      const topContent = root || post;
      const { id: topId } = topContent;
      id = topId;
    }
  }

  const postWithReplies = await prisma.post.findFirst({
    select: postSelect,
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
