// Select query for the route GET /posts/{postId}

import { Prisma } from '@prisma/client';
import { IPostPreview } from './postPreviewSelect';

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
  rootId: true,
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

export type NestedParentPostSelect = PostSelect & {
  parent?: { select: NestedParentPostSelect };
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

export function buildParentPostSelect(depth: number): NestedParentPostSelect {
  if (depth === 0) {
    return { ...selectFields };
  }

  const nestedReplies = buildParentPostSelect(depth - 1);

  return {
    ...selectFields,
    parent: {
      select: nestedReplies,
    },
  };
}

type PostPayload = Prisma.PostGetPayload<{ select: NestedPostSelect }>;
type NestedPostPayload = PostPayload & {
  replies?: NestedPostPayload[];
};

type ParentPostPayload = Prisma.PostGetPayload<{ select: NestedParentPostSelect }>;
// TODO: Fix this
type NestedParent = ParentPostPayload & { parent?: NestedParent };

export type IPostWithParents = NestedParent;
export type IPostWithReplies = NestedPostPayload & { root?: IPostPreview['root'] };
