// NOTE: this file should be a reference for frontend code
import { hashPersonalMessage, fromRpcSig } from "@ethereumjs/util";

import { computeEffEcdsaPubInput } from "@personaelabs/spartan-ecdsa";

import { buildPoseidon } from "circomlibjs";

import { MerkleProof, NymInput, EffECDSASig } from "./types";

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
  // TODO: re-use Poseidon instance
  const poseidon = await buildPoseidon();
  return poseidon([nymSigS, nymSigS]);
}

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
