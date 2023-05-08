import { Prisma } from '@prisma/client';

export const doxedPostSelect = {
  id: true,
  title: true,
  body: true,
  parentId: true,
  timestamp: true,
  upvotes: true,
} satisfies Prisma.DoxedPostSelect;

export const nymPostSelect = {
  id: true,
  title: true,
  body: true,
  parentId: true,
  timestamp: true,
  upvotes: true,
} satisfies Prisma.NymPostSelect;

export type DoxedPostPayload = Prisma.DoxedPostGetPayload<{ select: typeof doxedPostSelect }>;
export type NymPostPayload = Prisma.NymPostGetPayload<{ select: typeof nymPostSelect }>;

export type IPost = DoxedPostPayload | NymPostPayload;
