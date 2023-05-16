import { PrefixedHex } from '@personaelabs/nymjs';
import { IRootPost } from '../api';

export type PostProps = IRootPost & {
  shouldOpenModal?: boolean;
};

export type PostWithRepliesProps = IRootPost & {
  isOpen: boolean;
  handleClose: () => void;
  dateFromDescription: string;
};

export type ClientNym = {
  nymName: string;
  nymSig: string;
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
