// Select query for the route GET /posts/{postId}

import { Prisma } from '@prisma/client';

const selectFields = {
  id: true,
  title: true,
  body: true,
  timestamp: true,
  user: true,
  upvotes: {
    select: {
      id: true,
      address: true,
      timestamp: true,
    },
  },
};

// We need to hardcode the structure of the query to let Prisma infer the return types.
// (i.e. we can't use recursive function calls to construct this object)
export const postSelect = {
  ...selectFields,
  replies: {
    // Depth = 1
    select: {
      ...selectFields,
      replies: {
        // Depth = 2
        select: {
          ...selectFields,
          replies: {
            // Depth = 3
            select: {
              ...selectFields,
              replies: {
                // Depth = 4
                select: {
                  ...selectFields,
                  replies: {
                    // Depth = 5
                    select: {
                      ...selectFields,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.PostSelect;

type PostPayload = Prisma.PostGetPayload<{ select: typeof postSelect }>;
export type IPost = PostPayload;
export type IPostWithReplies = PostPayload;
