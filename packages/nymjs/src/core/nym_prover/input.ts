// NOTE: this file should be a reference for frontend code
import { hashPersonalMessage, fromRpcSig } from "@ethereumjs/util";

import { computeEffEcdsaPubInput } from "@personaelabs/spartan-ecdsa";

import { buildPoseidon } from "circomlibjs";
import {
  EffECDSASig,
  MerkleProof,
  NymProofInput,
} from "../../types/nym_prover";

import { bigIntToBytes, bufferToBigInt } from "../utils";

async function computeEffECDSASig(
  sigStr: string,
  msg: string
): Promise<EffECDSASig> {
  const { v, r: _r, s: _s } = fromRpcSig(sigStr);

  const r = bufferToBigInt(_r);
  const s = bufferToBigInt(_s);

  const msgHash = hashPersonalMessage(Buffer.from(msg));

  const { Tx, Ty, Ux, Uy } = computeEffEcdsaPubInput(r, v, msgHash);

  return { Tx, Ty, Ux, Uy, s };
}

async function computeNymHash(nymSigS: bigint) {
  // TODO: re-use Poseidon instance
  const poseidon = await buildPoseidon();
  return poseidon([nymSigS, nymSigS]);
}

/**
 *
 * @param membershipProof
 * @param content
 * @param contentSigStr
 * @param nym
 * @param nymSigStr
 * @returns
 */
export async function prepareInput(
  membershipProof: MerkleProof,

  content: string,
  contentSigStr: string,

  nym: string,
  nymSigStr: string
): Promise<NymProofInput> {
  const nymSig = await computeEffECDSASig(nymSigStr, nym);
  const contentSig = await computeEffECDSASig(contentSigStr, content);

  const nymHash = await computeNymHash(nymSig.s);

  return {
    membershipProof,

    nym,
    nymHash,
    nymSig,

    content,
    contentSig,
  };
}

/**
 * Public inputs that are passed to `nym_ownership` circuit (circuits/instances/nym_ownership.circom)
 *
 * This class exists to provide serialization/deserialization utilities for passing these values to
 * spartan wasm.
 */
export class NymCircuitPublicInput {
  constructor(
    private root: bigint,
    private nym: bigint,
    private nymSigTx: bigint,
    private nymSigTy: bigint,
    private nymSigUx: bigint,
    private nymSigUy: bigint,
    private nymHash: bigint,
    private content: bigint,
    private contentSigTx: bigint,
    private contentSigTy: bigint,
    private contentSigUx: bigint,
    private contentSigUy: bigint
  ) {}

  serialize(): Uint8Array {
    const serialized = new Uint8Array(32 * 12);

    // input ordered the way it must be passed to spartan-wasm
    const inputOrdered = [
      this.root,
      this.nym,
      this.nymSigTx,
      this.nymSigTy,
      this.nymSigUx,
      this.nymSigUy,
      this.nymHash,
      this.content,
      this.contentSigTx,
      this.contentSigTy,
      this.contentSigUx,
      this.contentSigUy,
    ];

    for (let i = 0; i < inputOrdered.length; i++) {
      const input: bigint = inputOrdered[i];
      serialized.set(bigIntToBytes(input, 32), 32 * i);
    }

    return serialized;
  }
}
