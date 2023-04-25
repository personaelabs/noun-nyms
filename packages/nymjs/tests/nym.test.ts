import * as path from 'path';
import { NymProver, ContentData, NymVerifier, NymPublicInput, NymMessage } from '../src/lib';
import { ecsign, ecrecover, hashPersonalMessage, toRpcSig } from '@ethereumjs/util';
import { Poseidon, Tree } from '@personaelabs/spartan-ecdsa';

describe('NymProver', () => {
  describe('prove and verify', () => {
    let proverPubKeyHash: bigint;
    const proverPrivKey = Buffer.from('da'.padStart(64, '0'), 'hex');
    const nymCode = 'satoshi';
    const contentData: ContentData = {
      title: 'title',
      body: 'body',
      parentContentId: '',
      timestamp: Math.floor(Date.now() / 1000),
    };

    const nymMessage: NymMessage = {
      version: 1,
      domainTag: 'nym',
      nymCode: nymCode,
    };

    // Hash nymCode and contentData for signing
    const nymCodeMsgHash = hashPersonalMessage(Buffer.from(JSON.stringify(nymMessage), 'utf8'));
    const contentDataMsgHash = hashPersonalMessage(
      Buffer.from(JSON.stringify(contentData), 'utf8'),
    );

    // Sign nymCode and contentData
    const nymSig = ecsign(nymCodeMsgHash, proverPrivKey);
    const contentDataSig = ecsign(contentDataMsgHash, proverPrivKey);

    // Recover public key of the signer
    const proverPubKey = ecrecover(nymCodeMsgHash, nymSig.v, nymSig.r, nymSig.s);

    // Initialize prover
    const config = {
      witnessGenWasm: path.join(__dirname, './circuit_artifacts/nym_ownership.wasm'),
      circuitUrl: path.join(__dirname, './circuit_artifacts/nym_ownership.circuit'),
      enableProfiler: true,
    };
    const prover = new NymProver(config);
    const verifier = new NymVerifier(config);
    const poseidon = new Poseidon();

    let proof: Uint8Array;
    let publicInput: NymPublicInput;

    beforeAll(async () => {
      await prover.initWasm();
      await poseidon.initWasm();

      // Create a Merkle tree with a single leaf,
      // and create a proof for that leaf
      proverPubKeyHash = poseidon.hashPubKey(proverPubKey);
      const tree = new Tree(20, poseidon);
      tree.insert(proverPubKeyHash);
      const membershipProof = tree.createProof(tree.indexOf(proverPubKeyHash));

      const fullProof = await prover.prove(
        membershipProof,
        JSON.stringify(contentData),
        toRpcSig(contentDataSig.v, contentDataSig.r, contentDataSig.s),
        nymMessage,
        toRpcSig(nymSig.v, nymSig.r, nymSig.s),
      );
      proof = fullProof.proof;
      publicInput = fullProof.publicInput;
    });

    it('should  prove and verify a valid signature and Merkle proof', async () => {
      const proofValid = await verifier.verify(publicInput, proof);
      expect(proofValid).toBe(true);
    });

    it('should assert invalid proof', async () => {
      proof[0] = 1;
      const proofValid = await verifier.verify(publicInput, proof);
      expect(proofValid).toBe(false);
    });

    it('should assert invalid public input', async () => {
      publicInput.contentSigR = publicInput.contentSigR + BigInt(1);
      const proofValid = await verifier.verify(publicInput, proof);
      expect(proofValid).toBe(false);
    });
  });
});
