import { POST_DEPTH } from '@/lib/constants';
import prisma from '@/lib/prisma';
import { IPostWithReplies, buildPostSelect, rootSelectFields } from '@/types/api';
import type { NextApiRequest, NextApiResponse } from 'next';

export const getPostWithReplies = async (id: string) => {
  const select = buildPostSelect(POST_DEPTH);

  const postWithReplies = await prisma.post.findFirst({
    select: { ...select, root: { select: { ...rootSelectFields } } },
    where: {
      id,
    },
  });

  if (!postWithReplies) throw new Error(`no post with replies found`);

  const result: IPostWithReplies = { ...postWithReplies };

  return result;
};
const handleGetPost = async (
  req: NextApiRequest,
  res: NextApiResponse<IPostWithReplies | { error: string }>,
) => {
  let id = req.query.postId as string;
  if (!id) {
    res.status(404).send({ error: 'Id not found' });
    return;
  }

  const result = await getPostWithReplies(id);

  res.send(result);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method == 'GET') {
    await handleGetPost(req, res);
  } else {
    res.status(400).send('Unsupported method');
  }
}
