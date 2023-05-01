export enum AttestationScheme {
  EIP712,
  Nym,
}

export enum HashScheme {
  Keccak256,
}

export type Content = {
  id: string;
  contentMessage: ContentMessage;
  attestation: Buffer;
  attestationScheme: AttestationScheme;
  hashScheme: HashScheme;
};

export type ContentMessage = {
  venue: string;
  title: string;
  body: string;
  parentId: string;
  groupRoot: string;
  timestamp: number;
};

export type Upvote = {
  id: string;
  contentId: string;
  groupRoot: string;
  timestamp: number;
  attestation: Buffer;
  attestationScheme: AttestationScheme; // Only support EIP712 for now
};

// Public input of the circuit `nym_ownership.circom`
export type PublicInput = {
  root: bigint;
  nymSigTx: bigint;
  nymSigTy: bigint;
  nymSigUx: bigint;
  nymSigUy: bigint;
  nymHash: bigint;
  contentSigTx: bigint;
  contentSigTy: bigint;
  contentSigUx: bigint;
  contentSigUy: bigint;
};

export type NymProofAuxiliary = {
  nymSigR: bigint;
  nymSigV: bigint;
  contentSigR: bigint;
  contentSigV: bigint;
};

export type EffECDSASig = {
  Tx: bigint;
  Ty: bigint;
  Ux: bigint;
  Uy: bigint;
  r: bigint;
  v: bigint;
  s: bigint; // private
};

// ################
// EIP712 types and constants
// ################

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

export type EIP712TypedData = {
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

export const CONTENT_MESSAGE_TYPES = {
  Post: [
    { name: 'venue', type: 'string' },
    { name: 'title', type: 'string' },
    { name: 'body', type: 'string' },
    { name: 'parentId', type: 'string' },
    { name: 'groupRoot', type: 'string' },
    { name: 'timestamp', type: 'uint256' },
  ],
};

export const UPVOTE_TYPES = {
  Upvote: [
    { name: 'contentId', type: 'string' },
    { name: 'groupRoot', type: 'string' },
    { name: 'timestamp', type: 'uint256' },
  ],
};
