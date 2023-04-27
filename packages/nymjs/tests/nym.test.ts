import * as path from 'path';
import {
  NymProver,
  NymVerifier,
  NYM_CODE_TYPE,
  DOMAIN,
  EIP712TypedData,
  CONTENT_DATA_TYPES,
  NymFullProof,
  eip712MsgHash,
} from '../src/lib';
import { ecsign, ecrecover, toRpcSig } from '@ethereumjs/util';
import { Poseidon, Tree } from '@personaelabs/spartan-ecdsa';

describe('NymProver', () => {
  describe('prove and verify', () => {
    let proverPubKeyHash: bigint;
    const proverPrivKey = Buffer.from('da'.padStart(64, '0'), 'hex');
    const nymCode = 'satoshi';

    // Hash nymCode and contentData for signing

    const typedNymCode: EIP712TypedData = {
      domain: DOMAIN,
      types: NYM_CODE_TYPE,
      value: { nymCode },
    };

    const nymCodeMsgHash = eip712MsgHash(
      typedNymCode.domain,
      typedNymCode.types,
      typedNymCode.value,
    );

    const typedContentData: EIP712TypedData = {
      domain: DOMAIN,
      types: CONTENT_DATA_TYPES,
      value: {
        venue: 'nouns',
        title: 'title',
        body: 'body',
        parentId: '',
        timestamp: Math.round(Date.now() / 1000),
      },
    };

    const contentDataMsgHash = eip712MsgHash(
      typedContentData.domain,
      typedContentData.types,
      typedContentData.value,
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

    let fullProof: NymFullProof;

    beforeAll(async () => {
      await prover.initWasm();
      await poseidon.initWasm();

      // Create a Merkle tree with a single leaf,
      // and create a proof for that leaf
      proverPubKeyHash = poseidon.hashPubKey(proverPubKey);
      const tree = new Tree(20, poseidon);
      tree.insert(proverPubKeyHash);
      const membershipProof = tree.createProof(tree.indexOf(proverPubKeyHash));

      fullProof = await prover.prove(
        typedNymCode,
        typedContentData,
        toRpcSig(nymSig.v, nymSig.r, nymSig.s),
        toRpcSig(contentDataSig.v, contentDataSig.r, contentDataSig.s),
        membershipProof,
      );
    });

    it('should  prove and verify a valid signature and Merkle proof', async () => {
      const proofValid = await verifier.verify(fullProof);
      expect(proofValid).toBe(true);
    });

    it('should assert invalid proof', async () => {
      fullProof.proof[0] = 1;
      const proofValid = await verifier.verify(fullProof);
      expect(proofValid).toBe(false);
    });

    it('should assert invalid public input', async () => {
      fullProof.publicInput.contentSigR = fullProof.publicInput.contentSigR + BigInt(1);
      const proofValid = await verifier.verify(fullProof);
      expect(proofValid).toBe(false);
    });
  });
});
