import * as path from 'path';
import {
  NymProver,
  ContentData,
  NymVerifier,
  NymPublicInput,
  NYM_CODE_TYPE,
  DOMAIN,
  eip712MsgHash,
  EIP712TypedValue,
  CONTENT_DATA_TYPES,
} from '../src/lib';
import { ecsign, ecrecover, toRpcSig } from '@ethereumjs/util';
import { Poseidon, Tree } from '@personaelabs/spartan-ecdsa';

describe('NymProver', () => {
  describe('prove and verify', () => {
    let proverPubKeyHash: bigint;
    const proverPrivKey = Buffer.from('da'.padStart(64, '0'), 'hex');
    const nymCode = 'satoshi';

    const contentData: ContentData = {
      venue: 'nouns',
      title: 'title',
      body: 'body',
      parentContentId: '',
      timestamp: Math.floor(Date.now() / 1000),
    };

    // Hash nymCode and contentData for signing

    const nymTypedData: EIP712TypedValue = {
      domain: DOMAIN,
      types: NYM_CODE_TYPE,
      value: { nymCode },
    };

    const nymCodeMsgHash = eip712MsgHash(
      nymTypedData.domain,
      nymTypedData.types,
      nymTypedData.value,
    );

    const contentDataTypedData: EIP712TypedValue = {
      domain: DOMAIN,
      types: CONTENT_DATA_TYPES,
      value: contentData,
    };

    const contentDataMsgHash = eip712MsgHash(
      contentDataTypedData.domain,
      contentDataTypedData.types,
      contentDataTypedData.value,
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
        contentDataTypedData,
        toRpcSig(contentDataSig.v, contentDataSig.r, contentDataSig.s),
        nymTypedData,
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
