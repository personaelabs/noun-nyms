import { Prisma } from '@prisma/client';

export const notificationFeedSelect = {
  id: true,
  title: true,
  body: true,
  userId: true,
  parentId: true,
  rootId: true,
  parent: {
    select: {
      title: true,
      body: true,
    },
  },
  root: {
    select: {
      title: true,
    },
  },
  upvotes: {
    select: {
      id: true,
      address: true,
      timestamp: true,
    },
  },
  timestamp: true,
} satisfies Prisma.PostSelect;

type NotificationFeedPayload = Prisma.PostGetPayload<{ select: typeof notificationFeedSelect }>;

export type INotificationFeed = NotificationFeedPayload;
