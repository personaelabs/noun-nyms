import * as path from 'path';
import {
  NymProver,
  NymVerifier,
  ContentMessage,
  Content,
  eip712MsgHash,
  AttestationScheme,
  recoverUpvotePubkey,
  toContent,
  toTypedNymCode,
  toTypedContentMessage,
  recoverContentPubkey,
  toTypedUpvote,
  toUpvote,
  bigIntToPrefixedHex,
} from '../src/lib';
import {
  ecsign,
  toRpcSig,
  toCompactSig,
  pubToAddress,
  privateToPublic,
  ECDSASignature,
} from '@ethereumjs/util';
import { MerkleProof, Poseidon, Tree } from '@personaelabs/spartan-ecdsa';

describe('nym', () => {
  const proverPrivKey = Buffer.from('da'.padStart(64, '0'), 'hex');
  const proverPubKey = privateToPublic(proverPrivKey);

  let contentMessage: ContentMessage;
  let contentMessageSig: ECDSASignature;
  let proverPubKeyHash: bigint;
  let membershipProof: MerkleProof;
  const poseidon = new Poseidon();

  beforeAll(async () => {
    await poseidon.initWasm();

    // Create a Merkle tree with a single leaf,
    // and create a proof for that leaf
    proverPubKeyHash = poseidon.hashPubKey(proverPubKey);
    const tree = new Tree(20, poseidon);
    tree.insert(proverPubKeyHash);

    membershipProof = tree.createProof(tree.indexOf(proverPubKeyHash));

    contentMessage = {
      venue: 'nouns',
      title: 'title',
      body: 'body',
      parentId: '0x',
      groupRoot: bigIntToPrefixedHex(tree.root()),
      timestamp: Math.round(Date.now() / 1000),
    };

    const typedContentMessage = toTypedContentMessage(contentMessage);

    const contentMessageMsgHash = eip712MsgHash(
      typedContentMessage.domain,
      typedContentMessage.types,
      typedContentMessage.value,
    );

    contentMessageSig = ecsign(contentMessageMsgHash, proverPrivKey);
  });

  // Recover address of the signer
  const proverAddress = pubToAddress(proverPubKey).toString('hex');

  describe('Content', () => {
    describe('AttestationScheme = Nym', () => {
      const nymCode = 'satoshi';

      // Sign the nymCode
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

        let content: Content;

        beforeAll(async () => {
          await prover.initWasm();

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

        it('should assert if contentMessage.groupRoot != publicInput.root', async () => {
          const groupRoot = contentMessage.groupRoot;
          content.contentMessage.groupRoot = bigIntToPrefixedHex(BigInt(groupRoot) + BigInt(1));
          const proofValid = await verifier.verify(content);
          expect(proofValid).toBe(false);

          content.contentMessage.groupRoot = groupRoot;
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
        const singer = recoverContentPubkey(content);
        expect(singer).toBe(`0x${proverPubKey.toString('hex')}`);
      });
    });
  });

  describe('Upvote', () => {
    const contentId = '0x1234';
    const timestamp = Math.round(Date.now() / 1000);
    const groupRoot = '0x1234';
    const typedUpvote = toTypedUpvote(contentId, timestamp, groupRoot);

    const typedUpvoteMsgHash = eip712MsgHash(
      typedUpvote.domain,
      typedUpvote.types,
      typedUpvote.value,
    );
    const upvoteSig = ecsign(typedUpvoteMsgHash, proverPrivKey);

    const upvote = toUpvote(
      contentId,
      groupRoot,
      timestamp,
      toCompactSig(upvoteSig.v, upvoteSig.r, upvoteSig.s),
    );

    it('should verify a valid upvote', async () => {
      const upvoteSigner = await recoverUpvotePubkey(upvote);
      expect(upvoteSigner).toBe(`0x${proverPubKey.toString('hex')}`);
    });
  });
});
