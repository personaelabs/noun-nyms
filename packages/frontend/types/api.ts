import { Prisma } from '@prisma/client';

export const postSelect = {
  id: true,
  title: true,
  body: true,
  parentId: true,
  timestamp: true,
  upvotes: true,
} satisfies Prisma.PostSelect;

export type PostPayload = Prisma.PostGetPayload<{ select: typeof postSelect }>;

export type IPost = PostPayload;
export type IPostWithReplies = IPost & { replies: IPostWithReplies[] };
