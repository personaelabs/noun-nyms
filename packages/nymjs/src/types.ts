export type EffECDSASig = {
  Tx: bigint;
  Ty: bigint;
  Ux: bigint;
  Uy: bigint;
  s: bigint; // private
};

export type MerkleProof = {
  root: bigint;
  siblings: bigint[];
  pathIndices: number[];
};

export type NymInput = {
  membershipProof: MerkleProof;

  nym: string;
  nymHash: string;
  nymSig: EffECDSASig;

  content: string;
  contentSig: EffECDSASig;
};
