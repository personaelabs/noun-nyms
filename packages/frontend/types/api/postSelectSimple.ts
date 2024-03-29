import { Prisma } from '@prisma/client';

export const selectFields = {
  id: true,
  title: true,
  body: true,
  timestamp: true,
  userId: true,
};

// We need to hardcode the structure of the query to let Prisma infer the return types.
// (i.e. we can't use recursive function calls to construct this object)
export const postSelectSimple = {
  ...selectFields,
} satisfies Prisma.PostSelect;

type PostPayload = Prisma.PostGetPayload<{ select: typeof postSelectSimple }>;
export type IPostSimple = Omit<PostPayload, 'timestamp'> & { name: string } & { timestamp: number };
