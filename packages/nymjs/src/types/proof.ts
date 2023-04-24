import { NymPublicInput } from '../lib';

export type EffECDSASig = {
  Tx: bigint;
  Ty: bigint;
  Ux: bigint;
  Uy: bigint;
  r: bigint;
  v: bigint;
  s: bigint; // private
};

/**
 * Return type from prover
 */
export interface NymProof {
  proof: Uint8Array;
  publicInput: NymPublicInput;
}
