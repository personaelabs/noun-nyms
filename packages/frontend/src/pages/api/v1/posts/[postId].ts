import { POST_DEPTH } from '@/lib/constants';
import prisma from '@/lib/prisma';
import {
  IPostWithReplies,
  postPreviewSelect,
  buildPostSelect,
  IPost,
  IPostPreview,
} from '@/types/api';
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
  let rootPost: IPostPreview['root'] | undefined = undefined;

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
      // If fromRoot is true and depth > POST_DEPTH, we return postID
      if (postPreview.depth > POST_DEPTH) {
        id = post.id;
        if (root) rootPost = root;
      }
    }
  }

  const select = buildPostSelect(POST_DEPTH);

  // Check the depth of the post I want to get. If > POST_DEPTH, fetch from that id.
  // If < POST_DEPTH, fetch from root.

  const postWithReplies = await prisma.post.findFirst({
    select: select,
    where: {
      id,
    },
  });

  if (!postWithReplies) {
    res.status(404).send({ error: 'Post not found' });
    return;
  }

  const result: IPostWithReplies = { ...postWithReplies };
  if (rootPost) result.root = rootPost;

  res.send(result);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method == 'GET') {
    await handleGetPost(req, res);
  } else {
    res.status(400).send('Unsupported method');
  }
}
