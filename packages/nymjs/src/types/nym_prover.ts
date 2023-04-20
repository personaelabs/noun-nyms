/**
 * NymProofInput contains all of the information necessary to generate a nym ownership proof
 *
 * TODO: change content to use ContentData
 */
export type NymProofInput = {
  membershipProof: MerkleProof;

  nym: string;
  nymHash: string;
  nymSig: EffECDSASig;

  content: string;
  contentSig: EffECDSASig;
};

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

/**
 * Return type from prover
 */
export interface NymProof {
  proof: Uint8Array;
  serializedPublicInput: Uint8Array;
}
