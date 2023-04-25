import { hashPersonalMessage, fromRpcSig } from '@ethereumjs/util';
import {
  CircuitPubInput,
  computeEffEcdsaPubInput,
  Poseidon,
  PublicInput,
} from '@personaelabs/spartan-ecdsa';
import { EffECDSASig } from '../types/proof';
import { bigIntToBytes, bufferToBigInt } from '../utils';
import { verifyEffEcdsaPubInput } from '@personaelabs/spartan-ecdsa';
import { NymMessage } from '../lib';

export function computeEffECDSASig(sigStr: string, msg: string): EffECDSASig {
  const { v, r: _r, s: _s } = fromRpcSig(sigStr);

  const r = bufferToBigInt(_r);
  const s = bufferToBigInt(_s);

  const msgHash = hashPersonalMessage(Buffer.from(msg, 'utf8'));

  const { Tx, Ty, Ux, Uy } = computeEffEcdsaPubInput(r, v, msgHash);

  return { Tx, Ty, Ux, Uy, s, r, v };
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

export class NymPublicInput {
  root: bigint;
  nym: NymMessage;
  nymHash: bigint;
  content: string;
  nymSigTx: bigint;
  nymSigTy: bigint;
  nymSigUx: bigint;
  nymSigUy: bigint;
  contentSigTx: bigint;
  contentSigTy: bigint;
  contentSigUx: bigint;
  contentSigUy: bigint;

  nymSigR: bigint;
  nymSigV: bigint;

  contentSigR: bigint;
  contentSigV: bigint;

  constructor(
    nymMessage: NymMessage,
    nymHash: bigint,
    content: string,
    root: bigint,
    nymSig: EffECDSASig,
    contentSig: EffECDSASig,
  ) {
    this.root = root;
    this.nym = nymMessage;
    this.nymHash = nymHash;
    this.content = content;

    this.nymSigTx = nymSig.Tx;
    this.nymSigTy = nymSig.Ty;
    this.nymSigUx = nymSig.Ux;
    this.nymSigUy = nymSig.Uy;

    this.contentSigTx = contentSig.Tx;
    this.contentSigTy = contentSig.Ty;
    this.contentSigUx = contentSig.Ux;
    this.contentSigUy = contentSig.Uy;

    this.nymSigR = nymSig.r;
    this.nymSigV = nymSig.v;

    this.contentSigR = contentSig.r;
    this.contentSigV = contentSig.v;
  }

  serialize(): Uint8Array {
    const serialized = new Uint8Array(32 * 12);

    // input ordered the way it must be passed to spartan-wasm
    const inputOrdered = [
      this.root,
      this.nymSigTx,
      this.nymSigTy,
      this.nymSigUx,
      this.nymSigUy,
      this.nymHash,
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

  verify(): boolean {
    let isNymSigPubInputValid;
    try {
      isNymSigPubInputValid = verifyEffEcdsaPubInput(this.nymSigPubInput());
    } catch (_e) {
      isNymSigPubInputValid = false;
    }

    let isContentSigPubInputValid;
    try {
      isContentSigPubInputValid = verifyEffEcdsaPubInput(this.contentSigPubInput());
    } catch (_e) {
      isContentSigPubInputValid = false;
    }

    return isNymSigPubInputValid && isContentSigPubInputValid;
  }

  private nymCodeSignedHash(): Buffer {
    return hashPersonalMessage(Buffer.from(JSON.stringify(this.nym), 'utf-8'));
  }

  private contentDataSignedHash(): Buffer {
    return hashPersonalMessage(Buffer.from(this.content, 'utf-8'));
  }

  private nymSigPubInput(): PublicInput {
    const nymSigPublicInput = new PublicInput(
      this.nymSigR,
      this.nymSigV,
      this.nymCodeSignedHash(),
      new CircuitPubInput(this.root, this.nymSigTx, this.nymSigTy, this.nymSigUx, this.nymSigUy),
    );

    return nymSigPublicInput;
  }

  private contentSigPubInput(): PublicInput {
    const contentSigPublicInput = new PublicInput(
      this.contentSigR,
      this.contentSigV,
      this.contentDataSignedHash(),
      new CircuitPubInput(
        this.root,
        this.contentSigTx,
        this.contentSigTy,
        this.contentSigUx,
        this.contentSigUy,
      ),
    );

    return contentSigPublicInput;
  }
}
