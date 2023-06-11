import axiosBase from 'axios';
import { EIP712TypedData, PrefixedHex, eip712MsgHash } from '@personaelabs/nymjs';
import { ecrecover, fromRpcSig } from '@ethereumjs/util';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ClientName, NameType } from '@/types/components';
dayjs.extend(relativeTime);

export const fromNowDate = (date: Date) => {
  return dayjs(date).fromNow();
};

export const getUserIdFromName = (user: ClientName): string => {
  if (user.name) {
    return user.type === NameType.PSEUDO ? `${user.name}-${user.nymHash}` : user.name;
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
