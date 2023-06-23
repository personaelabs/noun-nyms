// Select query for the route GET /users/{userId}/rootsUsed

import { Prisma } from '@prisma/client';

// Select query and return type for /users/{userId}/rootsUsed
export const rootsUsedSelect = {
  by: ['groupRoot'],
} satisfies Prisma.PostGroupByArgs;

type RootsUsedPayload = Prisma.GetPostGroupByPayload<typeof rootsUsedSelect>;

export type IRootsUsed = RootsUsedPayload;

// Select query and return type for /users/{userId}/rootsUsed/latest
export const latestRootUsedSelect = {
  groupRoot: true,
} satisfies Prisma.PostSelect;

type LatestRootUsedPayload = Prisma.PostGetPayload<{ select: typeof latestRootUsedSelect }>;

export type ILatestRootUsed = LatestRootUsedPayload;
