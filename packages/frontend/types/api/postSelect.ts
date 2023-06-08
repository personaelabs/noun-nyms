// Select query for the route GET /posts/{postId}

import { Prisma } from '@prisma/client';

const selectFields = {
  id: true,
  title: true,
  body: true,
  timestamp: true,
  userId: true,
  upvotes: {
    select: {
      id: true,
      address: true,
      timestamp: true,
    },
  },
  depth: true,
  parentId: true,
  _count: {
    select: {
      replies: true,
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

// Selects 5 layers up the tree for a post's parent.
export const parentSelect = {
  ...selectFields,
  parent: {
    // Depth = 1
    select: {
      ...selectFields,
      parent: {
        // Depth = 2
        select: {
          ...selectFields,
          parent: {
            // Depth = 3
            select: {
              ...selectFields,
              parent: {
                // Depth = 4
                select: {
                  ...selectFields,
                  parent: {
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
export type IPostWithReplies = PostPayload;
