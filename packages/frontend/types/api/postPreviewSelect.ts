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
export const postPreviewSelect = {
  ...postSelect,
  root: {
    select: {
      ...postSelect,
      _count: {
        select: {
          descendants: true,
        },
      },
    },
  },
  parent: {
    select: { ...postSelect },
  },
  _count: {
    select: {
      descendants: true,
    },
  },
} satisfies Prisma.PostSelect;

type PostPreviewPayload = Prisma.PostGetPayload<{ select: typeof postPreviewSelect }>;

export type IPostPreview = PostPreviewPayload;
