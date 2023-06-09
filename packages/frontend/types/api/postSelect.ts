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
} satisfies Prisma.PostSelect;

type PostSelect = typeof selectFields;

export type NestedPostSelect = PostSelect & {
  replies?: { select: NestedPostSelect };
};

export function buildPostSelect(depth: number): NestedPostSelect {
  if (depth === 0) {
    return { ...selectFields };
  }

  const nestedReplies = buildPostSelect(depth - 1);

  return {
    ...selectFields,
    replies: {
      select: nestedReplies,
    },
  };
}

type PostPayload = Prisma.PostGetPayload<{ select: NestedPostSelect }>;
type NestedPostPayload = PostPayload & {
  replies?: NestedPostPayload[];
};
export type IPostWithReplies = NestedPostPayload;
