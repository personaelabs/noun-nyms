import prisma from "../../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

// Return a single post and all of its children
const handleGetPost = async (req: NextApiRequest, res: NextApiResponse) => {
  const posts: any[] = await prisma.$queryRaw`
  WITH RECURSIVE thread AS (
	SELECT
		"id",
		"parentId",
		"address",
		"title",
		"body",
		"createdAt"
	FROM
		"Post"
	WHERE
		"id" = ${req.query.postId}
	UNION
	SELECT
		d. "id",
		d. "parentId",
		d. "address",
		d. "title",
		d. "body",
		d. "createdAt"
	FROM
		"Post" d
		INNER JOIN thread t ON d. "parentId" = t. "id"
    )
    SELECT
    	*
    FROM
    	thread;
  `;

  res.send(posts);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method == "GET") {
    await handleGetPost(req, res);
  } else {
    res.status(400).send("Unsupported method");
  }
}
