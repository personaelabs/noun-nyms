import prisma from '@/lib/prisma';
import { all } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

// Handle non-pseudonymous upvotes
// Verify the ECDSA signature and save the upvote
const fetchParents = async (req: NextApiRequest, res: NextApiResponse<{} | { error: string }>) => {
  const postId = req.query.postId as string;

  let newPost = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: {
      parent: true,
      upvotes: true,
    },
  });

  if (newPost) {
    const allPosts = [newPost];

    // fetch all parents of postId
    while (newPost) {
      // make a db query to fetch the currentPost
      if (newPost.parentId) {
        newPost = await prisma.post.findUnique({
          where: {
            id: newPost.parentId,
          },
          include: {
            parent: true,
            upvotes: true,
          },
        });
        if (newPost) {
          allPosts.push(newPost);
        }
      } else {
        newPost = null;
      }
    }

    // construct finaPostTree by iterating over allPosts in reverse order and setting the replies of each post to the previous post
    for (let i = allPosts.length - 1; i > 0; i--) {
      // @ts-ignore
      allPosts[i].replies = [allPosts[i - 1]];
    }

    // @ts-ignore
    allPosts[0].replies = [];

    res.status(200).send(allPosts[allPosts.length - 1]);
  } else {
    res.status(400).send({ error: 'Post could not be found' });
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method == 'GET') {
    await fetchParents(req, res);
  } else {
    res.status(400).send('Unsupported method');
  }
}
