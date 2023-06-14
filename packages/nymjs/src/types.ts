export type PrefixedHex = `0x${string}`;

export enum AttestationScheme {
  EIP712,
  Nym,
}

export enum HashScheme {
  Keccak256,
}

export type Post = {
  id: PrefixedHex;
  content: Content;
  attestation: Buffer;
  attestationScheme: AttestationScheme;
  hashScheme: HashScheme;
};

export type Content = {
  venue: string;
  title: string;
  body: string;
  parentId: PrefixedHex;
  groupRoot: PrefixedHex;
  timestamp: number;
};

export type Upvote = {
  id: PrefixedHex;
  postId: PrefixedHex;
  groupRoot: PrefixedHex;
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
  verifyingContract: PrefixedHex;
  salt: PrefixedHex;
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
  salt: '0x1f62937a3189e37c79aea1c4a1fcd5a56395069b1f973cc4d2218c3b65a6c9ff',
};

export const NYM_CODE_WARNING =
  'Please make sure the url is `nymz.xyz`. Leaking this signature can leak your anonymity.';

export const NYM_CODE_TYPE = {
  Nym: [
    { name: 'nymName', type: 'string' },
    {
      name: 'warning',
      type: 'string',
    },
  ],
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
    { name: 'postId', type: 'string' },
    { name: 'groupRoot', type: 'string' },
    { name: 'timestamp', type: 'uint256' },
  ],
};

// Copied from @personaelabs/spartan-ecdsa
export interface MerkleProof {
  root: bigint;
  siblings: [bigint][];
  pathIndices: number[];
}

// Copied from @personaelabs/spartan-ecdsa
export interface EffECDSAPubInput {
  Tx: bigint;
  Ty: bigint;
  Ux: bigint;
  Uy: bigint;
}
