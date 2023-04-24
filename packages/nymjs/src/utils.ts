// @ts-ignore
const snarkJs = require('snarkjs');
import * as fs from 'fs';

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

/**
 * Load a circuit from a file or URL
 */
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

export const bigIntToLeBytes = (n: bigint, size: number): Uint8Array => {
  const bytes = bigIntToBytes(n, size);
  return bytes.reverse();
};
