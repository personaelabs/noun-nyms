// @ts-ignore
const snarkJs = require('snarkjs');
import * as fs from 'fs';
import { keccak256 } from 'ethers/lib/utils';
import {
  AttestationScheme,
  CONTENT_MESSAGE_TYPES,
  ContentMessage,
  DOMAIN,
  EIP712Domain,
  EIP712Types,
  EIP712Value,
  HashScheme,
  NYM_CODE_TYPE,
  UPVOTE_TYPES,
  Upvote,
  PrefixedHex,
} from './types';
import { _TypedDataEncoder } from 'ethers/lib/utils';
import { ecrecover, fromRpcSig, pubToAddress } from '@ethereumjs/util';
import { computeEffEcdsaPubInput, Poseidon } from '@personaelabs/spartan-ecdsa';
import { EIP712TypedData, EffECDSASig, Content, PublicInput, NymProofAuxiliary } from './types';

// Byte length of a spartan-ecdsa proof
const PROOF_BYTE_LENGTH = 19391;

export const snarkJsWitnessGen = async (input: any, wasmFile: string) => {
  const witness: {
    type: string;
    data?: any;
  } = {
    type: 'mem',
  };

  await snarkJs.wtns.calculate(input, wasmFile, witness);
  return witness;
};

// Load a circuit from a file or URL
export const loadCircuit = async (pathOrUrl: string): Promise<Uint8Array> => {
  const isWeb = typeof window !== 'undefined';
  if (isWeb) {
    return await fetchCircuit(pathOrUrl);
  } else {
    return await readCircuitFromFs(pathOrUrl);
  }
};

const readCircuitFromFs = async (path: string): Promise<Uint8Array> => {
  const bytes = fs.readFileSync(path);
  return new Uint8Array(bytes);
};

const fetchCircuit = async (url: string): Promise<Uint8Array> => {
  const response = await fetch(url);

  const circuit = await response.arrayBuffer();

  return new Uint8Array(circuit);
};

export const bufferToBigInt = (bytes: Uint8Array): bigint =>
  BigInt('0x' + Buffer.from(bytes).toString('hex'));

export const bigIntToBytes = (n: bigint, size: number): Uint8Array => {
  const hex = n.toString(16);
  const hexPadded = hex.padStart(size * 2, '0');
  return Buffer.from(hexPadded, 'hex');
};

export const bigIntToPrefixedHex = (val: bigint): PrefixedHex => `0x${val.toString(16)}`;

// Borrowing from: https://github.com/personaelabs/heyanoun/blob/main/frontend/utils/utils.ts#L83
export function eip712MsgHash(
  domain: EIP712Domain,
  types: EIP712Types,
  value: EIP712Value,
): Buffer {
  //@ts-ignore
  const hash = _TypedDataEncoder.hash(domain, types, value);
  return Buffer.from(hash.replace('0x', ''), 'hex');
}

// Compute the contentId as specified in `SPECIFICATION.md`
export const computeContentId = (
  venue: string,
  title: string,
  body: string,
  parentId: PrefixedHex,
  groupRoot: PrefixedHex,
  timestamp: number,
  attestation: Buffer,
  hashScheme: HashScheme,
): PrefixedHex => {
  if (hashScheme !== HashScheme.Keccak256) {
    throw new Error('Unknown hash scheme');
  }

  const bytes = Buffer.concat([
    Buffer.from(venue, 'utf-8'),
    Buffer.from(title, 'utf-8'),
    Buffer.from(body, 'utf-8'),
    Buffer.from(parentId, 'utf-8'),
    Buffer.from(groupRoot, 'hex'),
    Buffer.from(timestamp.toString(16), 'hex'),
    attestation,
  ]);

  return keccak256(bytes) as PrefixedHex;
};

// Compute the id of an upvote as as specified in `SPECIFICATION.md`
export const computeUpvoteId = (
  contentId: string,
  groupRoot: string,
  timestamp: number,
  attestation: Buffer,
  hashScheme: HashScheme,
): PrefixedHex => {
  if (hashScheme !== HashScheme.Keccak256) {
    throw new Error('Unknown hash scheme');
  }

  const bytes = Buffer.concat([
    Buffer.from(contentId, 'utf-8'),
    Buffer.from(groupRoot, 'hex'),
    Buffer.from(timestamp.toString(16), 'hex'),
    attestation,
  ]);

  return keccak256(bytes) as PrefixedHex;
};

export function computeEffECDSASig(sigStr: string, typedData: EIP712TypedData): EffECDSASig {
  const { v, r: _r, s: _s } = fromRpcSig(sigStr);

  const r = bufferToBigInt(_r);
  const s = bufferToBigInt(_s);

  const msgHash = eip712MsgHash(typedData.domain, typedData.types, typedData.value);

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

export const serializePublicInput = (publicInput: PublicInput): Buffer => {
  const serialized = new Uint8Array(32 * 10);

  serialized.set(bigIntToBytes(publicInput.root, 32), 0);
  serialized.set(bigIntToBytes(publicInput.nymSigTx, 32), 32);
  serialized.set(bigIntToBytes(publicInput.nymSigTy, 32), 32 * 2);
  serialized.set(bigIntToBytes(publicInput.nymSigUx, 32), 32 * 3);
  serialized.set(bigIntToBytes(publicInput.nymSigUy, 32), 32 * 4);
  serialized.set(bigIntToBytes(publicInput.nymHash, 32), 32 * 5);
  serialized.set(bigIntToBytes(publicInput.contentSigTx, 32), 32 * 6);
  serialized.set(bigIntToBytes(publicInput.contentSigTy, 32), 32 * 7);
  serialized.set(bigIntToBytes(publicInput.contentSigUx, 32), 32 * 8);
  serialized.set(bigIntToBytes(publicInput.contentSigUy, 32), 32 * 9);

  return Buffer.from(serialized);
};

// Serialize an attestation of the `Nym` attestation scheme
export const serializeNymAttestation = (
  proof: Buffer,
  publicInput: PublicInput,
  auxiliary: NymProofAuxiliary,
  nymCode: string,
): Buffer => {
  // TBD
  const numPublicInput = Object.values(publicInput).length;
  const nymCodeSer = Buffer.from(nymCode, 'utf-8');

  const serialized = new Uint8Array(
    proof.length + 32 * numPublicInput + 32 * 2 + 2 + nymCodeSer.length,
  );

  // Append the proof bytes
  serialized.set(proof);

  // Append the serialized public input
  serialized.set(serializePublicInput(publicInput), proof.length);

  // Append the serialized auxiliary input
  serialized.set(bigIntToBytes(auxiliary.nymSigR, 32), proof.length + 32 * numPublicInput);
  serialized.set(bigIntToBytes(auxiliary.nymSigV, 1), proof.length + 32 * numPublicInput + 32);
  serialized.set(bigIntToBytes(auxiliary.contentSigR, 32), proof.length + 32 * numPublicInput + 33);
  serialized.set(
    bigIntToBytes(auxiliary.contentSigV, 1),
    proof.length + 32 * numPublicInput + 33 + 32,
  );

  serialized.set(nymCodeSer, proof.length + 32 * numPublicInput + 32 * 2 + 2);

  return Buffer.from(serialized);
};

// Deserialize an attestation of the `Nym` attestation scheme
export const deserializeNymAttestation = (
  attestation: Buffer,
): {
  nymCode: string;
  proof: Buffer;
  publicInput: PublicInput;
  auxiliary: NymProofAuxiliary;
} => {
  const attestationSer = Uint8Array.from(attestation);
  const numPublicInputs = 10;

  const proofOffset = PROOF_BYTE_LENGTH;
  const publicInputOffset = 32 * numPublicInputs;
  const auxiliaryOffset = 33 * 2;

  const proof = attestationSer.slice(0, proofOffset);

  const publicInputSer = attestationSer.slice(proofOffset, proofOffset + publicInputOffset);
  const auxiliarySer = attestationSer.slice(
    proofOffset + publicInputOffset,
    proofOffset + publicInputOffset + auxiliaryOffset,
  );

  const nymCode = attestationSer.slice(
    proofOffset + publicInputOffset + auxiliaryOffset,
    attestationSer.length,
  );

  // Parse the auxiliary
  const auxiliary: NymProofAuxiliary = {
    nymSigR: bufferToBigInt(auxiliarySer.slice(0, 32)),
    nymSigV: bufferToBigInt(auxiliarySer.slice(32, 33)),
    contentSigR: bufferToBigInt(auxiliarySer.slice(33, 65)),
    contentSigV: bufferToBigInt(auxiliarySer.slice(65, 66)),
  };

  // Parse the public input
  const publicInput: PublicInput = {
    root: bufferToBigInt(publicInputSer.slice(0, 32)),
    nymSigTx: bufferToBigInt(publicInputSer.slice(32, 64)),
    nymSigTy: bufferToBigInt(publicInputSer.slice(64, 96)),
    nymSigUx: bufferToBigInt(publicInputSer.slice(96, 128)),
    nymSigUy: bufferToBigInt(publicInputSer.slice(128, 160)),
    nymHash: bufferToBigInt(publicInputSer.slice(160, 192)),
    contentSigTx: bufferToBigInt(publicInputSer.slice(192, 224)),
    contentSigTy: bufferToBigInt(publicInputSer.slice(224, 256)),
    contentSigUx: bufferToBigInt(publicInputSer.slice(256, 288)),
    contentSigUy: bufferToBigInt(publicInputSer.slice(288, 320)),
  };

  return {
    nymCode: Buffer.from(nymCode).toString('utf-8'),
    proof: Buffer.from(proof),
    publicInput,
    auxiliary,
  };
};

export const toTypedNymCode = (nymCode: string): EIP712TypedData => ({
  domain: DOMAIN,
  types: NYM_CODE_TYPE,
  value: { nymCode },
});

export const toTypedContentMessage = (contentMessage: ContentMessage): EIP712TypedData => ({
  domain: DOMAIN,
  types: CONTENT_MESSAGE_TYPES,
  value: contentMessage,
});

export const toTypedUpvote = (contentId: string, timestamp: number, groupRoot: string) => {
  return {
    domain: DOMAIN,
    types: UPVOTE_TYPES,
    value: { contentId, timestamp, groupRoot },
  };
};

// Return an object that is equivalent to `Content` specified in `SPECIFICATION.md`
export const toContent = (
  contentMessage: ContentMessage,
  attestation: Buffer | string,
  attestationScheme: AttestationScheme,
): Content => {
  const hashScheme = HashScheme.Keccak256;

  if (attestationScheme === AttestationScheme.EIP712 && typeof attestation !== 'string') {
    throw new Error('EIP712 attestation must be ERC-2098 encoded string');
  }

  if (attestationScheme === AttestationScheme.EIP712) {
    attestation = Buffer.from((attestation as string).replace('0x', ''), 'hex');
  }

  const id = computeContentId(
    contentMessage.venue,
    contentMessage.title,
    contentMessage.body,
    contentMessage.parentId,
    contentMessage.groupRoot,
    contentMessage.timestamp,
    attestation as Buffer,
    hashScheme,
  );

  return {
    id,
    contentMessage,
    attestation: attestation as Buffer,
    attestationScheme,
    hashScheme,
  };
};

// Return an object that is equivalent to `Upvote` specified in `SPECIFICATION.md`
export const toUpvote = (
  contentId: PrefixedHex,
  groupRoot: PrefixedHex,
  timestamp: number,
  sig: string,
): Upvote => {
  const attestation = Buffer.from(sig.replace('0x', ''), 'hex');
  const upvoteId = computeUpvoteId(
    contentId,
    groupRoot,
    timestamp,
    attestation,
    HashScheme.Keccak256,
  );

  return {
    id: upvoteId,
    contentId,
    groupRoot,
    timestamp,
    attestation,
    attestationScheme: AttestationScheme.EIP712,
  };
};

// Recover the signer of a Content with an EIP712 attestation
export const recoverContentPubkey = (content: Content): PrefixedHex => {
  if (content.attestationScheme !== AttestationScheme.EIP712) {
    throw new Error('Only the signer of an EIP712 attestation is recoverable.');
  }

  const typedContentMessage = toTypedContentMessage(content.contentMessage);
  const msgHash = eip712MsgHash(
    typedContentMessage.domain,
    typedContentMessage.types,
    typedContentMessage.value,
  );

  const { v, r, s } = fromRpcSig('0x' + content.attestation.toString('hex'));
  const pubKey = ecrecover(msgHash, v, r, s);

  return `0x${pubKey.toString('hex')}`;
};

// Recover the signer of an Upvote
export const recoverUpvotePubkey = (upvote: Upvote): string => {
  if (upvote.attestationScheme !== AttestationScheme.EIP712) {
    throw new Error('Only the signer of an EIP712 attestation is recoverable.');
  }

  const typedUpvote = toTypedUpvote(upvote.contentId, upvote.timestamp, upvote.groupRoot);
  const msgHash = eip712MsgHash(typedUpvote.domain, typedUpvote.types, typedUpvote.value);

  const { v, r, s } = fromRpcSig('0x' + upvote.attestation.toString('hex'));
  const pubKey = ecrecover(msgHash, v, r, s);

  return `0x${pubKey.toString('hex')}`;
};
