import { IRootPost } from '../api';

export type PostProps = IRootPost & {
  shouldOpenModal?: boolean;
};

export type PostWithRepliesProps = IRootPost & {
  isOpen: boolean;
  handleClose: (isOpen: boolean) => void;
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
