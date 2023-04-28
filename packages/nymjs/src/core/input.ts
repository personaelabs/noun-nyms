import { CircuitPubInput, PublicInput } from '@personaelabs/spartan-ecdsa';
import { EffECDSASig } from '../types';
import { bigIntToBytes } from '../utils';
import { verifyEffEcdsaPubInput } from '@personaelabs/spartan-ecdsa';
import { EIP712TypedData } from '../lib';
import { eip712MsgHash } from '../lib';

export class NymPublicInput {
  root: bigint;
  typedNymCode: EIP712TypedData;
  nymHash: bigint;
  typedContent: EIP712TypedData;
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
    typedNymCode: EIP712TypedData,
    typedContent: EIP712TypedData,
    nymSig: EffECDSASig,
    contentSig: EffECDSASig,
    nymHash: bigint,
    root: bigint,
  ) {
    this.root = root;
    this.typedNymCode = typedNymCode;
    this.typedContent = typedContent;
    this.nymHash = nymHash;

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
    return eip712MsgHash(
      this.typedNymCode.domain,
      this.typedNymCode.types,
      this.typedNymCode.value,
    );
  }

  private contentDataSignedHash(): Buffer {
    return eip712MsgHash(
      this.typedContent.domain,
      this.typedContent.types,
      this.typedContent.value,
    );
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
