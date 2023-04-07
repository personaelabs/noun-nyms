// NOTE: this file should be a reference for frontend code
import { hashPersonalMessage, fromRpcSig } from "@ethereumjs/util";

// NOTE: wagmi signMessage uses Wallet.signMessage under the hood
import { Wallet } from "ethers";

import { computeEffEcdsaPubInput } from "@personaelabs/spartan-ecdsa";

// NOTE: OBVIOUSLY DON'T USE THIS ANYWHERE!
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

export type NymInput = {
  root: bigint;
  pathIndices: number[]; // private
  siblings: bigint[]; // private

  nym: string;
  nymHash: string;
  nymSig: EffECDSASig;

  content: string;
  contentSig: EffECDSASig;
};

function bufferToBigInt(buf: Buffer): bigint {
  return BigInt("0x" + buf.toString("hex"));
}

// NOTE: return type here should be something that has Ts, Us, S
async function computeSig(signer: Wallet, msg: string): Promise<EffECDSASig> {
  const sig = await signer.signMessage(msg);
  const { v, r: _r, s: _s } = fromRpcSig(sig);

  const r = bufferToBigInt(_r);
  const s = bufferToBigInt(_s);

  const msgHash = hashPersonalMessage(Buffer.from(msg));

  const { Tx, Ty, Ux, Uy } = computeEffEcdsaPubInput(r, v, msgHash);

  return { Tx, Ty, Ux, Uy, s };
}

// TODO: figure out merkle root input
export async function computeNymInput(
  signer: Wallet,
  content: string,
  nym: string
): Promise<NymInput> {
  const nymSig = await computeSig(signer, nym);
  const contentSig = await computeSig(signer, content);

  return {
    root: BigInt(0),
    pathIndices: [],
    siblings: [],

    nym,
    nymHash: nym,
    nymSig,

    content,
    contentSig,
  };
}
