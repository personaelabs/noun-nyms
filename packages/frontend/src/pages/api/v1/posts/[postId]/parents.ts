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
import { getPostWithReplies } from '../[postId]';

// Return a single post and all of its replies till depth = 5
// TODO: Return all replies with a much higher depth limit
const handleGetParents = async (
  req: NextApiRequest,
  res: NextApiResponse<IPostWithReplies | { error: string }>,
) => {
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
    const result = await getPostWithReplies(currPost.id, false);
    res.send(result);
  } else {
    res.status(404).send({ error: 'Parents not found' });
    return;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method == 'GET') {
    await handleGetParents(req, res);
  } else {
    res.status(400).send('Unsupported method');
  }
}
