import { POST_DEPTH } from '@/lib/constants';
import prisma from '@/lib/prisma';
import { IPostWithReplies, postPreviewSelect, buildPostSelect, IPostPreview } from '@/types/api';
import type { NextApiRequest, NextApiResponse } from 'next';

export const getPostPreview = async (id: string) => {
  const postPreview = await prisma.post.findFirst({
    select: postPreviewSelect,
    where: {
      id,
    },
  });
  return postPreview;
};

export const getRootAndPostIdFromPreview = (
  fromRoot: boolean,
  postPreview: IPostPreview | null,
) => {
  if (postPreview) {
    const { root, ...post } = postPreview;
    // topContent now contains the root.
    const topContent = root || post;
    // Post id to fetch is the root by default.
    let id = topContent.id;
    // If fromRoot is true and depth > POST_DEPTH, we return postID
    if (fromRoot && postPreview.depth > POST_DEPTH) {
      id = post.id;
    }
    // However, if we don't want to fetch from the root, we maintain the original postId.
    if (!fromRoot) id = post.id;
    return { rootPost: topContent, id };
  } else {
    throw new Error(`post preview not found`);
  }
};
const handleGetPost = async (
  req: NextApiRequest,
  res: NextApiResponse<IPostWithReplies | { error: string }>,
) => {
  const fromRoot = !!(req.query.fromRoot && req.query.fromRoot == 'true');

  // If fromRoot is true, we get the rootId of the given post
  let id = req.query.postId as string;
  if (!id) {
    res.status(404).send({ error: 'Id not found' });
    return;
  }

  const postPreview = await getPostPreview(id);
  const { id: postId, rootPost } = getRootAndPostIdFromPreview(fromRoot, postPreview);

  const select = buildPostSelect(POST_DEPTH);

  const postWithReplies = await prisma.post.findFirst({
    select: select,
    where: {
      id: postId,
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
