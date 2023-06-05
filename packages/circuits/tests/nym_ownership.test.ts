const wasm_tester = require('circom_tester').wasm;
import * as path from 'path';
import { Poseidon, computeEffEcdsaPubInput } from '@personaelabs/spartan-ecdsa';
import { ecsign, hashPersonalMessage, privateToPublic } from '@ethereumjs/util';
import { constructTree, bytesToBigInt, CircuitInput, deepCopy } from './test_utils';

// process.env.CI is set to true in GitHub Actions
const maybe = process.env.CI ? describe.skip : describe;

maybe('nym ownership', () => {
  let circuitInput: CircuitInput;
  let circuit: any;

  beforeAll(async () => {
    circuit = await wasm_tester(path.join(__dirname, '../instances/nym_ownership.circom'), {
      prime: 'secq256k1', // Specify to use the option --prime secq256k1 when compiling with circom
    });

    // Init the Poseidon hash function
    const poseidon = new Poseidon();
    await poseidon.initWasm();

    // ########################
    // Sign the nym and compute nymHash
    // ########################

    const nym = Buffer.from('statoshi', 'utf8');
    const privKey = Buffer.from(''.padStart(16, '🧙'), 'utf16le');
    const nymMsgHash = hashPersonalMessage(nym);
    const nymSig = ecsign(nymMsgHash, privKey);
    const nymHash = poseidon.hash([bytesToBigInt(nymSig.s), bytesToBigInt(nymSig.s)]);

    const nymSigEffECDSAInput = computeEffEcdsaPubInput(
      bytesToBigInt(nymSig.r),
      nymSig.v,
      nymMsgHash,
    );

    // ########################
    // Sign the content
    // ########################

    const content = Buffer.from('nyms are eternal', 'utf8');
    const contentMsgHash = hashPersonalMessage(content);
    const contentSig = ecsign(contentMsgHash, privKey);

    const contentSigEffECDSAInput = computeEffEcdsaPubInput(
      bytesToBigInt(contentSig.r),
      contentSig.v,
      contentMsgHash,
    );

    // ########################
    // Construct the Merkle tree and create a Merkle proof
    // ########################

    const privKeys = [
      Buffer.from(''.padStart(16, '🧙'), 'utf16le'),
      Buffer.from(''.padStart(16, '🪄'), 'utf16le'),
      Buffer.from(''.padStart(16, '🔮'), 'utf16le'),
    ];

    const tree = await constructTree(privKeys, poseidon);
    const proverPubKey = poseidon.hashPubKey(privateToPublic(privKey));
    const merkleProof = tree.createProof(tree.indexOf(proverPubKey));

    // ########################
    // Prepare the input
    // ########################

    const nymSigTx = nymSigEffECDSAInput.Tx;
    const nymSigTy = nymSigEffECDSAInput.Ty;
    const nymSigUx = nymSigEffECDSAInput.Ux;
    const nymSigUy = nymSigEffECDSAInput.Uy;

    const contentSigTx = contentSigEffECDSAInput.Tx;
    const contentSigTy = contentSigEffECDSAInput.Ty;
    const contentSigUx = contentSigEffECDSAInput.Ux;
    const contentSigUy = contentSigEffECDSAInput.Uy;

    circuitInput = {
      nymHash,

      // Efficient ECDSA signature of the nym
      nymSigTx,
      nymSigTy,
      nymSigUx,
      nymSigUy,
      nymSigS: bytesToBigInt(nymSig.s),

      // Efficient ECDSA signature of the content
      contentSigTx,
      contentSigTy,
      contentSigUx,
      contentSigUy,
      contentSigS: bytesToBigInt(contentSig.s),

      // Merkle proof
      siblings: merkleProof.siblings.map((sibling) => sibling[0]),
      pathIndices: merkleProof.pathIndices,
      root: tree.root(),
    };
  });

  it('should pass when both signatures and the Merkle proof are valid', async () => {
    const w = await circuit.calculateWitness(circuitInput, true);
    await circuit.checkConstraints(w);
  });

  // Check that the circuit fails when any of the inputs is invalid
  [
    'nymHash',
    'nymSigTx',
    'nymSigTy',
    'nymSigUx',
    'nymSigUy',
    'nymSigS',
    'contentSigTx',
    'contentSigTy',
    'contentSigUx',
    'contentSigUy',
    'contentSigS',
    'siblings',
    'pathIndices',
    'root',
  ].forEach((key) => {
    it.failing(`should fail when ${key} is invalid`, async () => {
      const invalidCircuitInput = deepCopy(circuitInput);
      if (key === 'siblings') {
        invalidCircuitInput.siblings[0] += BigInt(1);
      } else if (key === 'pathIndices') {
        invalidCircuitInput.pathIndices[0] += 1;
      } else {
        (invalidCircuitInput[key] as bigint) += BigInt(1);
      }

      const w = await circuit.calculateWitness(
        {
          ...invalidCircuitInput,
        },
        true,
      );
      circuit.checkConstraints(w);
    });
  });
});
