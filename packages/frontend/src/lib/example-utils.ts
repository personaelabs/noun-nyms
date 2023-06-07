import axiosBase from 'axios';
import { EIP712TypedData, PrefixedHex, eip712MsgHash } from '@personaelabs/nymjs';
import { ecrecover, fromRpcSig } from '@ethereumjs/util';

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
