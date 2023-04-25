import { _TypedDataEncoder } from 'ethers/lib/utils';

export type EIP712Domain = {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: `0x${string}`;
};

export type EIP712Types = {
  [key: string]: { name: string; type: string }[];
};

export type EIP712Value = {
  [key: string]: string | number;
};

export type EIP712TypedValue = {
  domain: EIP712Domain;
  types: EIP712Types;
  value: EIP712Value;
};

export const DOMAIN: EIP712Domain = {
  name: 'nym',
  version: '1',
  chainId: 1,
  verifyingContract: '0x0000000000000000000000000000000000000000',
};

export const NYM_CODE_TYPE = {
  Nym: [{ name: 'nymCode', type: 'string' }],
};

export const CONTENT_DATA_TYPES = {
  Post: [
    { name: 'venue', type: 'string' },
    { name: 'title', type: 'string' },
    { name: 'body', type: 'string' },
    { name: 'parentContentId', type: 'string' },
    { name: 'timestamp', type: 'uint256' },
  ],
};

// Borrowing from: https://github.com/personaelabs/heyanoun/blob/main/frontend/utils/utils.ts#L83
export function eip712MsgHash(
  domain: EIP712Domain,
  types: EIP712Types,
  value: EIP712Value,
): Buffer {
  //@ts-ignore
  const hash = _TypedDataEncoder.hash(domain, types, value);
  return Buffer.from(hash.replace('0x', ''), 'hex');
}
