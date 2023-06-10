// Select query for the route GET /posts/{postId}

import { Prisma } from '@prisma/client';
import { IPostPreview } from './postPreviewSelect';

export const postSelectFields = {
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
      descendants: true,
    },
  },
} satisfies Prisma.PostSelect;

export const rootSelectFields = {
  ...postSelectFields,
  _count: {
    select: {
      descendants: true,
    },
  },
};

type PostSelect = typeof postSelectFields;
type IPost = Prisma.PostGetPayload<{ select: PostSelect }>;
type IRootPost = Prisma.PostGetPayload<{ select: typeof rootSelectFields }>;

export type NestedPostSelect = PostSelect & {
  replies?: { select: NestedPostSelect };
};

export type NestedParentPostSelect = PostSelect & {
  parent?: { select: NestedParentPostSelect };
};

export function buildPostSelect(depth: number): NestedPostSelect {
  if (depth === 0) {
    return { ...postSelectFields };
  }

  const nestedReplies = buildPostSelect(depth - 1);

  return {
    ...postSelectFields,
    replies: {
      select: nestedReplies,
    },
  };
}

export function buildParentPostSelect(depth: number): NestedParentPostSelect {
  if (depth === 0) {
    return { ...postSelectFields };
  }

  const nestedReplies = buildParentPostSelect(depth - 1);

  return {
    ...postSelectFields,
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
type NestedParent = ParentPostPayload & { parent?: NestedParent };

export type IPostWithParents = NestedParent;
export type IPostWithReplies = NestedPostPayload & { root?: IRootPost | null };
