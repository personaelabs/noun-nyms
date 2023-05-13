// Select query for the route GET /users/{userId}/upvotes

import { Prisma } from '@prisma/client';

export const userUpvotesSelect = {
  id: true,
  post: {
    select: {
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
    },
  },
  timestamp: true,
} satisfies Prisma.DoxedUpvoteSelect;

type UserUpvotePayload = Prisma.DoxedUpvoteGetPayload<{ select: typeof userUpvotesSelect }>;

export type IUserUpvote = UserUpvotePayload & {
  post: Omit<UserUpvotePayload['post'], '_count'> & { replyCount: number };
};
