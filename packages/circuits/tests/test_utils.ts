import { hashPersonalMessage, ecsign, privateToPublic } from '@ethereumjs/util';
import { Poseidon, computeEffEcdsaPubInput, Tree } from '@personaelabs/spartan-ecdsa';

export type CircuitInput = {
  nymHash: bigint;

  // Efficient ECDSA signature of the nym
  nymSigTx: bigint;
  nymSigTy: bigint;
  nymSigUx: bigint;
  nymSigUy: bigint;
  nymSigS: bigint;

  // Efficient ECDSA signature of the content
  contentSigTx: bigint;
  contentSigTy: bigint;
  contentSigUx: bigint;
  contentSigUy: bigint;
  contentSigS: bigint;

  // Merkle proof
  siblings: bigint[];
  pathIndices: number[];
  root: bigint;
  [key: string]: bigint | bigint[] | number[];
};

export const deepCopy = (obj: any) => JSON.parse(JSON.stringify(obj));

export const getEffEcdsaCircuitInput = (privKey: Buffer, msg: Buffer) => {
  const msgHash = hashPersonalMessage(msg);
  const { v, r: _r, s } = ecsign(msgHash, privKey);
  const r = BigInt('0x' + _r.toString('hex'));

  const circuitPubInput = computeEffEcdsaPubInput(r, v, msgHash);
  const input = {
    s: BigInt('0x' + s.toString('hex')),
    Tx: circuitPubInput.Tx,
    Ty: circuitPubInput.Ty,
    Ux: circuitPubInput.Ux,
    Uy: circuitPubInput.Uy,
  };

  return input;
};

export const constructTree = async (privKeys: Buffer[], poseidon: Poseidon): Promise<Tree> => {
  const nLevels = 20;
  const tree = new Tree(nLevels, poseidon);

  // Store public key hashes
  const pubKeyHashes: bigint[] = [];

  // Compute public key hashes
  for (const privKey of privKeys) {
    const pubKey = privateToPublic(privKey);
    const pubKeyHash = poseidon.hashPubKey(pubKey);
    pubKeyHashes.push(pubKeyHash);
  }

  // Insert the pubkey hashes into the tree
  for (const pubKeyHash of pubKeyHashes) {
    tree.insert(pubKeyHash);
  }

  // Sanity check (check that there are not duplicate members)
  expect(new Set(pubKeyHashes).size === pubKeyHashes.length).toBeTruthy();

  return tree;
};

export const bytesToBigInt = (bytes: Uint8Array): bigint =>
  BigInt('0x' + Buffer.from(bytes).toString('hex'));
