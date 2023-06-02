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
};

export enum NotificationType {
  Upvote,
  DirectReply,
  DiscussionReply,
}

export type UpvoteNotification = {
  id: string;
  postId: string; // The post that was upvoted
  postText: string;
  userId: string;
  userName: string;
  type: NotificationType;
  read: boolean;
  timestamp: Date;
};

export type ReplyNotification = UpvoteNotification & {
  replyText: string;
};

export type Notification = ReplyNotification | UpvoteNotification;
