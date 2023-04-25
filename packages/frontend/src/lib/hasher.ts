import { Poseidon } from '@personaelabs/spartan-ecdsa';

const poseidonHasher = new Poseidon();

let hasherInitialized = false;
export const hashBytes = async (bytes: Uint8Array): Promise<string> => {
  if (!hasherInitialized) {
    await poseidonHasher.initWasm();
    hasherInitialized = true;
  }

  const chunks = [];
  for (let i = 0; i < bytes.length; i += 32) {
    chunks.push(BigInt('0x' + Buffer.from(bytes.slice(i, i + 32)).toString('hex')));
  }

  let hash;
  for (let i = 0; i < chunks.length; i++) {
    if (i === 0) {
      hash = await poseidonHasher.hash([chunks[i]]);
    } else {
      hash = await poseidonHasher.hash([chunks[i], hash as bigint]);
    }
  }

  return (hash as bigint).toString(16);
};
