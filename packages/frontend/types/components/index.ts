import { PrefixedHex } from '@personaelabs/nymjs';
import { IPostPreview } from '../api';
import { Dispatch, SetStateAction } from 'react';

export type PostProps = IPostPreview & {
  showUserHeader?: boolean;
  handleOpenPost: (writerToShow: string) => void;
  onSuccess: () => void;
};

export type PostWithRepliesProps = {
  postId: string;
  writerToShow?: string;
  onData: (postInProg: string) => void;
};

export type LocalNym = {
  nymName: string;
  nymSig: string;
  nymHash: string;
};

export enum NameType {
  PSEUDO,
  DOXED,
}

export type ClientName = {
  type: NameType;
  name: string | undefined;
  nymSig?: string;
  nymHash?: string;
};

export type ClientUpvote = {
  id: string;
  address: string;
  timestamp: Date;
};

export type Member = {
  pubkey: string;
  path: string[];
  indices: number[];
};

export type ContentUserInput = {
  title: string;
  body: string;
  parentId: PrefixedHex;
};

export type UserContextType = {
  isMobile: boolean;
  nymOptions: ClientName[];
  setNymOptions: Dispatch<SetStateAction<ClientName[]>>;
  isValid: boolean;
  routeLoading: boolean;
  pushRoute: (route: string) => void;
};

export enum NotificationType {
  Upvote,
  DirectReply,
  DiscussionReply,
}

export interface BaseNotification {
  entityId: string;
  read: boolean;
  type: NotificationType;
  id: string;
  userId: string;
  title: string;
  body: string;
  timestamp: Date;
}

export type UpvoteNotification = BaseNotification & {
  type: NotificationType.Upvote;
};

export type ReplyNotification = BaseNotification & {
  type: NotificationType.DirectReply | NotificationType.DiscussionReply;
};

export type Notification = ReplyNotification | UpvoteNotification;

export type NotificationsContextType = {
  notifications: Notification[];
  unreadNotifications: Notification[];
};
