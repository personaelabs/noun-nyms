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
  const postPreview = await prisma.post.findFirst({
    select: postPreviewSelect,
    where: {
      id,
    },
  });

  // TODO: explain logic better
  if (postPreview) {
    const { root, ...post } = postPreview;
    const topContent = root || post;
    rootPost = topContent;
    const { id: topId } = topContent;
    id = topId;
    // If fromRoot is true and depth > POST_DEPTH, we return postID
    if (fromRoot && postPreview.depth > POST_DEPTH) {
      id = post.id;
    }
    if (!fromRoot) id = post.id;
  }

  const select = buildPostSelect(POST_DEPTH);

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
