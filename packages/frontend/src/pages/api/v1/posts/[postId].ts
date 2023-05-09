import prisma from '@/lib/prisma';
import { IPost, IPostWithReplies } from '@/types/api';
import type { NextApiRequest, NextApiResponse } from 'next';

// Return a single post and all of its replies
const handleGetPost = async (req: NextApiRequest, res: NextApiResponse) => {
  let posts: any[] = await prisma.$queryRaw`
	WITH RECURSIVE all_posts AS (
			SELECT
				posts. "id",
				"title",
				"body",
				"parentId",
				count("postUpvotes". "id") AS "upvotes",
				posts. "timestamp"
			FROM
				"NymPost" posts
			LEFT JOIN "DoxedUpvote" "postUpvotes" ON posts.id = "postUpvotes". "postId"
		GROUP BY
			posts. "id"
		UNION
		SELECT
			posts. "id",
			"title",
			"body",
			"parentId",
			count("postUpvotes". "id") AS "upvotes",
			posts. "timestamp"
		FROM
			"DoxedPost" posts
			LEFT JOIN "DoxedUpvote" "postUpvotes" ON posts.id = "postUpvotes". "postId"
		GROUP BY
			posts.id
		),
		thread AS (
			SELECT
				"id",
				"title",
				"body",
				"parentId",
				"upvotes",
				"timestamp"
			FROM
				all_posts
			WHERE
				"id" = ${req.query.postId}
			UNION
			SELECT
				d. "id",
				d. "title",
				d. "body",
				d. "parentId",
				d. "upvotes",
				d. "timestamp"
			FROM
				all_posts d
				INNER JOIN thread t ON d. "parentId" = t. "id"
		)
		SELECT
			*
		FROM
			thread;
  `;

  // `upvotes` is in BigInt, so we need to convert it to a number
  posts = posts.map((post) => ({ ...post, upvotes: parseInt(post.upvotes) }));

  // Transform the flat array of posts into a nested array of posts
  const rootPost: IPost = posts.find((post) => post.id === req.query.postId);

  const withReplies = (parentId: string): IPostWithReplies[] => {
    const replies = posts.filter((post) => post.parentId === parentId);
    return replies.map((reply) => ({
      ...reply,
      replies: withReplies(reply.id),
    }));
  };

  const postWithNestedReplies: IPostWithReplies = {
    ...rootPost,
    replies: withReplies(rootPost.id),
  };

  res.send(postWithNestedReplies);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method == 'GET') {
    await handleGetPost(req, res);
  } else {
    res.status(400).send('Unsupported method');
  }
}
