// Select query for the route GET /users/{userId}/upvotes

import { Prisma } from '@prisma/client';
import { postPreviewSelect } from './postPreviewSelect';

export const userUpvotesSelect = {
  id: true,
  timestamp: true,
  post: {
    select: { ...postPreviewSelect },
  },
} satisfies Prisma.DoxedUpvoteSelect;

type UserUpvotePayload = Prisma.DoxedUpvoteGetPayload<{ select: typeof userUpvotesSelect }>;

export type IUserUpvote = UserUpvotePayload & {
  post: Omit<UserUpvotePayload['post'], '_count'> & { replyCount: number };
};
