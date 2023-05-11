// Select query for the route GET /posts

import { Prisma } from '@prisma/client';

export const rootPostsSelect = {
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
  _count: {
    select: {
      descendants: true,
    },
  },
} satisfies Prisma.PostSelect;

type rootPostPayload = Prisma.PostGetPayload<{ select: typeof rootPostsSelect }>;

export type IRootPost = Omit<rootPostPayload, '_count'> & { replyCount: number };
