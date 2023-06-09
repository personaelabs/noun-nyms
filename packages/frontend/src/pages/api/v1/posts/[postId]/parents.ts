import { POST_DEPTH } from '@/lib/constants';
import prisma from '@/lib/prisma';
import {
  IPostWithReplies,
  postPreviewSelect,
  buildPostSelect,
  IPostPreview,
  buildParentPostSelect,
  IPostWithParents,
} from '@/types/api';
import type { NextApiRequest, NextApiResponse } from 'next';

// Return a single post and all of its replies till depth = 5
// TODO: Return all replies with a much higher depth limit
const handleGetParents = async (
  req: NextApiRequest,
  res: NextApiResponse<IPostWithReplies | { error: string }>,
) => {
  const fromRoot = !!(req.query.fromRoot && req.query.fromRoot == 'true');
  let id = req.query.postId as string;

  // Before we do anything, get the parents of a post
  const parentSelect = buildParentPostSelect(POST_DEPTH);

  const parentPostWithReplies: IPostWithParents | null = await prisma.post.findFirst({
    select: parentSelect,
    where: {
      id,
    },
  });

  if (parentPostWithReplies) {
    // Get the top most parent
    let currPost = parentPostWithReplies;
    while (currPost.depth > 1) {
      if (currPost.parent) currPost = currPost.parent;
      else break;
    }
    console.log(`found parent at depth`, currPost.depth);
    // Now run the logic to get the posts + children of curr post.
    res.send(parentPostWithReplies);
  } else {
    res.status(404).send({ error: 'Parents not found' });
    return;
  }

  // If fromRoot is true, we get the rootId of the given post
  // let rootPost: IPostPreview['root'] | undefined = undefined;

  // // First get postPreview.
  // const postPreview = await prisma.post.findFirst({
  //   select: postPreviewSelect,
  //   where: {
  //     id,
  //   },
  // });

  // // TODO: explain logic better
  // if (postPreview) {
  //   const { root, ...post } = postPreview;
  //   // topContent now contains the root.
  //   const topContent = root || post;
  //   rootPost = topContent;
  //   // Post id to fetch is the root by default.
  //   id = topContent.id;
  //   // If fromRoot is true and depth > POST_DEPTH, we return postID
  //   if (fromRoot && postPreview.depth > POST_DEPTH) {
  //     id = post.id;
  //   }
  //   // However, if we don't want to fetch from the root, we maintain the original postId.
  //   if (!fromRoot) id = post.id;
  // }

  // const select = buildPostSelect(POST_DEPTH);

  // const postWithReplies = await prisma.post.findFirst({
  //   select: select,
  //   where: {
  //     id,
  //   },
  // });

  // if (!postWithReplies) {
  //   res.status(404).send({ error: 'Post not found' });
  //   return;
  // }

  // const result: IPostWithReplies = { ...postWithReplies };
  // if (rootPost) result.root = rootPost;

  // res.send(result);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method == 'GET') {
    await handleGetParents(req, res);
  } else {
    res.status(400).send('Unsupported method');
  }
}
