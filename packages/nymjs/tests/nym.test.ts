import * as path from 'path';
import {
  NymProver,
  NymVerifier,
  ContentMessage,
  Content,
  eip712MsgHash,
  AttestationScheme,
  recoverContentSigner,
  toContent,
  toTypedNymCode,
  toTypedContentMessage,
} from '../src/lib';
import { ecsign, ecrecover, toRpcSig, toCompactSig, pubToAddress } from '@ethereumjs/util';
import { Poseidon, Tree } from '@personaelabs/spartan-ecdsa';

describe('nym', () => {
  let proverPubKeyHash: bigint;
  const proverPrivKey = Buffer.from('da'.padStart(64, '0'), 'hex');

  const contentMessage: ContentMessage = {
    venue: 'nouns',
    title: 'title',
    body: 'body',
    parentId: '',
    timestamp: Math.round(Date.now() / 1000),
  };

  const typedContentMessage = toTypedContentMessage(contentMessage);

  const contentMessageMsgHash = eip712MsgHash(
    typedContentMessage.domain,
    typedContentMessage.types,
    typedContentMessage.value,
  );

  const contentMessageSig = ecsign(contentMessageMsgHash, proverPrivKey);

  // Recover public key of the signer
  const proverPubKey = ecrecover(
    contentMessageMsgHash,
    contentMessageSig.v,
    contentMessageSig.r,
    contentMessageSig.s,
  );

  // Recover address of the signer
  const proverAddress = pubToAddress(proverPubKey).toString('hex');

  describe('AttestationScheme = Nym', () => {
    const nymCode = 'satoshi';

    const typedNymCode = toTypedNymCode(nymCode);
    const nymCodeMsgHash = eip712MsgHash(
      typedNymCode.domain,
      typedNymCode.types,
      typedNymCode.value,
    );

    const nymSig = ecsign(nymCodeMsgHash, proverPrivKey);
    describe('prove and verify', () => {
      // Initialize prover
      const config = {
        witnessGenWasm: path.join(__dirname, './circuit_artifacts/nym_ownership.wasm'),
        circuitUrl: path.join(__dirname, './circuit_artifacts/nym_ownership.circuit'),
        enableProfiler: true,
      };
      const prover = new NymProver(config);
      const verifier = new NymVerifier(config);
      const poseidon = new Poseidon();

      let content: Content;

      beforeAll(async () => {
        await prover.initWasm();
        await poseidon.initWasm();

        // Create a Merkle tree with a single leaf,
        // and create a proof for that leaf
        proverPubKeyHash = poseidon.hashPubKey(proverPubKey);
        const tree = new Tree(20, poseidon);
        tree.insert(proverPubKeyHash);
        const membershipProof = tree.createProof(tree.indexOf(proverPubKeyHash));

        const attestation = await prover.prove(
          nymCode,
          contentMessage,
          toRpcSig(nymSig.v, nymSig.r, nymSig.s),
          toRpcSig(contentMessageSig.v, contentMessageSig.r, contentMessageSig.s),
          membershipProof,
        );

        content = toContent(contentMessage, attestation, AttestationScheme.Nym);
      });

      it('should  prove and verify a valid signature and Merkle proof', async () => {
        const proofValid = await verifier.verify(content);
        expect(proofValid).toBe(true);
      });

      it('should assert invalid attestation', async () => {
        content.attestation[0] = content.attestation[0] + 1;
        const proofValid = await verifier.verify(content);
        expect(proofValid).toBe(false);

        content.attestation[0] = content.attestation[0] - 1;
      });

      // TODO: test invalid public input
      // TODO: test invalid auxiliary
    });
  });

  describe('AttestationScheme = EIP712', () => {
    let content: Content;
    beforeAll(() => {
      const attestation = toCompactSig(
        contentMessageSig.v,
        contentMessageSig.r,
        contentMessageSig.s,
      );

      content = toContent(contentMessage, attestation, AttestationScheme.EIP712);
    });

    it('should verify a EIP712 attested content', () => {
      const singer = recoverContentSigner(content);
      expect(singer).toBe(proverAddress);
    });
  });
});
