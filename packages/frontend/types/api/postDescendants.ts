// Select query for the route GET /posts

import { Prisma } from '@prisma/client';

const postSelect = {
  id: true,
  title: true,
  body: true,
  timestamp: true,
  userId: true,
  depth: true,
  upvotes: {
    select: {
      id: true,
      address: true,
      timestamp: true,
    },
  },
};

/** Need post count for Root, but not parent */
export const postDescendantsSelect = {
  ...postSelect,
  descendants: {
    select: { ...postSelect },
  },
  root: {
    select: {
      ...postSelect,
      descendants: {
        select: {
          ...postSelect,
        },
      },
    },
  },
} satisfies Prisma.PostSelect;

type PostPreviewPayload = Prisma.PostGetPayload<{ select: typeof postDescendantsSelect }>;

export type IPostWDescendants = PostPreviewPayload;
