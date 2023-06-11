import { ClientName } from '../components';

export enum NotificationType {
  Upvote,
  DirectReply,
  DiscussionReply,
}

export interface NotificationMap {
  [id: string]: Notification;
}

export interface BaseNotification {
  read: boolean;
  type: NotificationType;
  id: string; // Either postId or upvoteId
  postId: string; // Always postId
  userId: string;
  title: string; // notification Title.
  body: string; // notification Body.
  timestamp: Date;
}

export type UpvoteNotification = BaseNotification & {
  type: NotificationType.Upvote;
};

export type ReplyNotification = BaseNotification & {
  type: NotificationType.DirectReply | NotificationType.DiscussionReply;
};

export type Notification = UpvoteNotification | ReplyNotification;

export type setReadArgs = {
  address: string | undefined;
  id?: string;
  markAll?: boolean;
};

export type setFetchArgs = {
  address: string;
  nymOptions: ClientName[];
};

export type NotificationsContextType = {
  notifications: Notification[];
  unread: Notification[];
  isLoading: boolean;
  setAsRead: (args: setReadArgs) => void;
  fetchNotifications: (args: setFetchArgs) => Promise<void>;
  lastRefresh: string;
  errorMsg: string;
};
