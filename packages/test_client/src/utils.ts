import { Tree, Poseidon } from '@personaelabs/spartan-ecdsa';
import { privateToPublic } from '@ethereumjs/util';

export const constructDummyTree = async (poseidon: Poseidon): Promise<Tree> => {
  const nLevels = 20;
  const tree = new Tree(nLevels, poseidon);

  // Store public key hashes
  const pubKeyHashes: bigint[] = [];

  const privKeys = [
    Buffer.from(''.padStart(16, '🧙'), 'utf16le'),
    Buffer.from(''.padStart(16, '🪄'), 'utf16le'),
    Buffer.from(''.padStart(16, '🔮'), 'utf16le'),
  ];

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

  return tree;
};
