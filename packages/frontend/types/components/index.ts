import { PrefixedHex } from '@personaelabs/nymjs';
import { IPostPreview } from '../api';
import { Dispatch, SetStateAction } from 'react';
import { Proposal } from '@/hooks/useProposals';

export type PostProps = {
  post: IPostPreview;
  showUserHeader?: boolean;
  handleOpenPost: (writerToShow: string) => void;
  onSuccess: () => Promise<void>;
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
  userId?: string;
  isEns?: boolean;
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
  postInProg: boolean;
  setPostInProg: Dispatch<SetStateAction<boolean>>;
  isValid: boolean;
  routeLoading: boolean;
  pushRoute: (route: string) => void;
};

export type PropsContextType = {
  proposals: Proposal[] | undefined;
};
