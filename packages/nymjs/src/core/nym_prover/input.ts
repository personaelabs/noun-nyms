import { hashPersonalMessage, fromRpcSig } from '@ethereumjs/util';
import { computeEffEcdsaPubInput, Poseidon } from '@personaelabs/spartan-ecdsa';
import { EffECDSASig, MerkleProof, NymProofInput } from '../../types/nym_prover';
import { bigIntToBytes, bufferToBigInt } from '../utils';

async function computeEffECDSASig(sigStr: string, msg: string): Promise<EffECDSASig> {
  console.log('sigStr', sigStr);
  const { v, r: _r, s: _s } = fromRpcSig(sigStr);

  const r = bufferToBigInt(_r);
  const s = bufferToBigInt(_s);

  const msgHash = hashPersonalMessage(Buffer.from(msg, 'utf8'));

  const { Tx, Ty, Ux, Uy } = computeEffEcdsaPubInput(r, v, msgHash);

  return { Tx, Ty, Ux, Uy, s };
}

let poseidon: Poseidon | null;
// Compute nymHash = Poseidon([nymSig.s, nymSig.s])
export async function computeNymHash(nymSig: string): Promise<string> {
  const nymSigS = bufferToBigInt(fromRpcSig(nymSig).s);

  if (!poseidon) {
    poseidon = new Poseidon();
    await poseidon.initWasm();
  }

  return poseidon.hash([nymSigS, nymSigS]).toString(16);
}

export async function prepareInput(
  membershipProof: MerkleProof,
  content: string,
  contentSigStr: string,
  nym: string,
  nymSigStr: string,
): Promise<NymProofInput> {
  const nymSig = await computeEffECDSASig(nymSigStr, nym);
  const contentSig = await computeEffECDSASig(contentSigStr, content);

  const nymHash = await computeNymHash(nymSigStr);

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
 * Inputs that are passed to `nym_ownership` circuit (circuits/instances/nym_ownership.circom)
 *
 * This class exists to provide serialization/deserialization utilities for passing these values to
 * spartan wasm.
 */
export class NymCircuitInput {
  root: bigint;
  nym: bigint;
  nymHash: bigint;
  content: bigint;
  nymSigTx: bigint;
  nymSigTy: bigint;
  nymSigUx: bigint;
  nymSigUy: bigint;
  contentSigTx: bigint;
  contentSigTy: bigint;
  contentSigUx: bigint;
  contentSigUy: bigint;

  constructor(input: NymProofInput) {
    this.root = input.membershipProof.root;
    this.nym = bufferToBigInt(Buffer.from(input.nym, 'utf8'));
    this.nymHash = bufferToBigInt(Buffer.from(input.nymHash, 'hex'));
    this.content = bufferToBigInt(Buffer.from(input.content, 'utf8'));

    this.nymSigTx = input.nymSig.Tx;
    this.nymSigTy = input.nymSig.Ty;
    this.nymSigUx = input.nymSig.Ux;
    this.nymSigUy = input.nymSig.Uy;

    this.contentSigTx = input.contentSig.Tx;
    this.contentSigTy = input.contentSig.Ty;
    this.contentSigUx = input.contentSig.Ux;
    this.contentSigUy = input.contentSig.Uy;
  }

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
