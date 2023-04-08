// NOTE: this file should be a reference for frontend code
import { hashPersonalMessage, fromRpcSig } from "@ethereumjs/util";

// NOTE: wagmi signMessage uses Wallet.signMessage under the hood
import { Wallet } from "ethers";

import { computeEffEcdsaPubInput } from "@personaelabs/spartan-ecdsa";

import { buildPoseidon } from "circomlibjs";

// NOTE: OBVIOUSLY DON'T USE THIS ANYWHERE! IT'S COMPROMISED.AF
export const testPrivateKey =
  "0x58d23b55bc9cdce1f18c2500f40ff4ab7245df9a89505e9b1fa4851f623d241d";
export const testSigner = new Wallet(testPrivateKey);

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

function bufferToBigInt(buf: Buffer): bigint {
  return BigInt("0x" + buf.toString("hex"));
}

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
  const poseidon = await buildPoseidon();
  return poseidon([nymSigS, nymSigS]);
}

// NOTE: this method may not need be exposed, just generate proof
export async function computeNymInput(
  membershipProof: MerkleProof,

  content: string,
  contentSigStr: string,

  nym: string,
  nymSigStr: string
): Promise<NymInput> {
  const nymSig = await computeEffECDSASig(nymSigStr, nym);
  const contentSig = await computeEffECDSASig(contentSigStr, content);

  // TODO: type-check poseidon input properly once I'm testing proving
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

// TODO: generate proof method
