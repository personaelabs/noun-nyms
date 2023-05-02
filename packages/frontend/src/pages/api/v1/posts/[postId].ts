import prisma from '../../../../lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

// Return a single post and all of its children
const handleGetPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const posts: any[] = await prisma.$queryRaw`
	WITH RECURSIVE all_posts AS (
		SELECT
		"id",
		"title",
		"body",
		"parentId",
		"timestamp"
		FROM
			"NymPost"
		UNION
		SELECT
			"id",
			"title",
			"body",
			"parentId",
			"timestamp"
		FROM
			"DoxedPost"
		),
		thread AS (
		SELECT
			"id",
			"title",
			"body",
			"parentId",
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

  res.send(posts);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method == 'GET') {
    await handleGetPost(req, res);
  } else {
    res.status(400).send('Unsupported method');
  }
}
