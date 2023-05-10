import prisma from '../../../../lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

// Build a recursive query to fetch a post and all of its replies
const buildRecursiveQuery = (depth: number): any => {
  if (depth == 5) {
    return false;
  }

  return {
    select: {
      id: true,
      title: true,
      body: true,
      timestamp: true,
      user: true,
      _count: {
        select: {
          upvotes: true,
        },
      },
      children: buildRecursiveQuery(depth + 1),
    },
    orderBy: {
      timestamp: 'desc',
    },
  };
};

const recursiveQuery = buildRecursiveQuery(0);

// Format the nested data returned from the database
const formatPostWithReplies = (postWithRepliesRaw: any): any =>
  postWithRepliesRaw.map((postWithReplies: any) => ({
    id: postWithReplies.id,
    title: postWithReplies.title,
    body: postWithReplies.body,
    timestamp: postWithReplies.timestamp,
    user: postWithReplies.user,
    upvoteCount: postWithReplies._count.upvotes,
    children: formatPostWithReplies(postWithReplies.children),
  }));

// Return a single post and all of its replies till depth = 5
const handleGetPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const postWithRepliesRaw = await prisma.post.findMany({
    ...recursiveQuery,
    where: {
      id: req.query.postId as string,
    },
  });

  const postWithReplies = formatPostWithReplies(postWithRepliesRaw);
  res.send(postWithReplies);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method == 'GET') {
    await handleGetPost(req, res);
  } else {
    res.status(400).send('Unsupported method');
  }
}
