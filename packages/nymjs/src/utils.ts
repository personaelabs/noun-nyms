// @ts-ignore
const snarkJs = require('snarkjs');
import * as fs from 'fs';
import { keccak256 } from 'ethers/lib/utils';
import { EIP712Domain, EIP712Types, EIP712Value, HashScheme, NymFullProof } from './types';
import { _TypedDataEncoder } from 'ethers/lib/utils';
import { fromRpcSig } from '@ethereumjs/util';
import { computeEffEcdsaPubInput, Poseidon } from '@personaelabs/spartan-ecdsa';
import { EIP712TypedData, EffECDSASig } from './types';

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

export function computeEffECDSASig(sigStr: string, msg: EIP712TypedData): EffECDSASig {
  const { v, r: _r, s: _s } = fromRpcSig(sigStr);

  const r = bufferToBigInt(_r);
  const s = bufferToBigInt(_s);

  const msgHash = eip712MsgHash(msg.domain, msg.types, msg.value);

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

export const serializeNymFullProof = (fullProof: NymFullProof) =>
  Buffer.concat([fullProof.proof, fullProof.publicInput.serialize()]);
