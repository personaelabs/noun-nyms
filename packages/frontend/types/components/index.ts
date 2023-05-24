import { PrefixedHex } from '@personaelabs/nymjs';
import { IPostPreview } from '../api';

export type PostProps = IPostPreview & {
  showUserHeader?: boolean;
  handleOpenPost: (writerToShow: string) => void;
  onSuccess: () => void;
};

export type PostWithRepliesProps = {
  postId: string;
  writerToShow?: string;
  handleClose: () => void;
};

export type ClientNym = {
  nymName: string;
  nymSig: string;
  nymHash: string;
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
