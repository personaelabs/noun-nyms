import { NymPublicInput } from './lib';

// ################
// Enums
// ################

export enum AttestationScheme {
  EIP712,
  Nym,
}

export enum HashScheme {
  Keccak256,
}

// ################
// Core Types
// ################

// The `Content` object defined in `Nym data model specification (Dan)`
export type Content = {
  id: string;
  venue: string;
  title: string;
  body: string;
  parentId: string;
  timestamp: number;
  attestation: Buffer;
  attestationScheme: AttestationScheme;
  hashScheme: HashScheme;
};

// The `Upvote` object defined in `Nym data model specification (Dan)`
export type Upvote = {
  id: string;
  contentId: string;
  timestamp: number;
  attestation: Buffer;
  attestationScheme: AttestationScheme; // Only support EIP712 for now
};

export type NymFullProof = {
  proof: Uint8Array;
  publicInput: NymPublicInput;
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

export const CONTENT_DATA_TYPES = {
  Post: [
    { name: 'venue', type: 'string' },
    { name: 'title', type: 'string' },
    { name: 'body', type: 'string' },
    { name: 'parentId', type: 'string' },
    { name: 'timestamp', type: 'uint256' },
  ],
};
