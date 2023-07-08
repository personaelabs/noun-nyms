import axiosBase from 'axios';
import { EIP712TypedData, PrefixedHex, eip712MsgHash } from '@personaelabs/nymjs';
import { ecrecover, fromRpcSig } from '@ethereumjs/util';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ClientName, NameType } from '@/types/components';
import { Proposal } from '@/hooks/useProposals';
dayjs.extend(relativeTime);

export const splitNym = (str: string) => {
  const parts = str.split('-');
  const result = parts.slice(0, parts.length - 1).join('-');
  return { nymName: result, nymHash: parts[parts.length - 1] };
};

export const fromNowDate = (date: Date) => {
  return dayjs(date).fromNow();
};

export const getUserIdFromName = (user: ClientName): string => {
  if (user.name) {
    if (user.type === NameType.PSEUDO) {
      return `${user.name}-${user.nymHash}`;
    } else if (user.isEns && user.userId) return user.userId;
    else {
      return user.name;
    }
  } else return '';
};

export const axios = axiosBase.create({
  baseURL: `/api/v1`,
});

type Member = {
  pubkey: string;
  path: string[];
  indices: number[];
};

export const getLatestGroup = async () => {
  const { data } = await axios.get('/groups/latest');

  const group: {
    root: PrefixedHex;
    members: Member[];
  } = data;

  return group;
};

export const getPubKeyFromEIP712Sig = (typedData: EIP712TypedData, sig: string): string => {
  const { v, r, s } = fromRpcSig(sig);
  return `0x${ecrecover(
    eip712MsgHash(typedData.domain, typedData.types, typedData.value),
    v,
    r,
    s,
  ).toString('hex')}`;
};

export const trimAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const trimText = (text: string) => {
  if (text.length < 50) {
    return text;
  }
  return `${text.slice(0, 50)}...`;
};

export const scrollToPost = async (postId?: string) => {
  let postElement: HTMLElement | null = null;
  if (postId) {
    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve: (post: HTMLElement | null) => void) =>
      //wait for DOM to update
      setTimeout(() => {
        postElement = document.getElementById(postId);
        if (postElement) {
          postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        resolve(postElement);
      }, 200),
    );
  }
};

export const refetchAndScrollToPost = async (refetch: () => Promise<any>, postId?: string) => {
  await refetch();
  const post = await scrollToPost(postId);
  setTimeout(() => {
    if (post) post.style.setProperty('opacity', '1');
  }, 1000);
};

export const replaceHashNumberWithLink = (inputString: string, props: Proposal[]) => {
  const getPropName = (str: string) => {
    const propNumber = str.substring(1);
    const propToShow = props.find((p) => p.id === propNumber);
    const replacement = propToShow?.title || str;
    return `[#${propNumber} ${replacement}](https://nouns.wtf/vote/${propNumber})`;
  };

  const regex = /#(\d+)/g;
  const outputString = inputString.replace(regex, getPropName);
  return outputString;
};

export const calculateNodeDistanceFromRight = (node: HTMLElement): number => {
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  const rect = node.getBoundingClientRect();
  const distanceFromRight = viewportWidth - rect.right;
  return distanceFromRight;
};
