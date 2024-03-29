import * as path from 'path';
import {
  NymProver,
  NymVerifier,
  Post,
  Content,
  eip712MsgHash,
  AttestationScheme,
  recoverUpvotePubkey,
  toPost,
  toTypedNymName,
  toTypedContent,
  recoverPostPubkey,
  toTypedUpvote,
  toUpvote,
  bigIntToPrefixedHex,
  PrefixedHex,
  MerkleProof,
} from '../src/lib';
import {
  ecsign,
  toRpcSig,
  toCompactSig,
  pubToAddress,
  privateToPublic,
  ECDSASignature,
  privateToAddress,
} from '@ethereumjs/util';
import { IncrementalMerkleTree } from '@zk-kit/incremental-merkle-tree';
import { INCONSISTENT_SIGNERS, INVALID_MERKLE_PROOF } from '../src/errors';
import { poseidonHashPubKey, poseidonHashSync } from '../src/utils';
import { init } from '../src/wasm';

describe('nym', () => {
  const proverPrivKey = Buffer.from('da'.padStart(64, '0'), 'hex');
  const proverPubKey = privateToPublic(proverPrivKey);

  let content: Content;
  let contentMessageSig: ECDSASignature;
  let proverPubKeyHash: bigint;
  let membershipProof: MerkleProof;

  beforeAll(async () => {
    await init();
    // Create a Merkle tree with a single leaf,
    // and create a proof for that leaf
    proverPubKeyHash = await poseidonHashPubKey(proverPubKey);
    const tree = new IncrementalMerkleTree(poseidonHashSync, 20, BigInt(0));
    tree.insert(proverPubKeyHash);

    membershipProof = tree.createProof(tree.indexOf(proverPubKeyHash));

    content = {
      venue: 'nouns',
      title: 'title',
      body: 'body',
      parentId: '0x',
      groupRoot: bigIntToPrefixedHex(tree.root),
      timestamp: Math.round(Date.now() / 1000),
    };

    const typedContent = toTypedContent(content);

    const contentMessageMsgHash = eip712MsgHash(
      typedContent.domain,
      typedContent.types,
      typedContent.value,
    );

    contentMessageSig = ecsign(contentMessageMsgHash, proverPrivKey);
  });

  // Recover address of the signer
  const proverAddress = pubToAddress(proverPubKey).toString('hex');

  describe('Content', () => {
    describe('AttestationScheme = Nym', () => {
      const nymName = 'satoshi';

      // Sign the nymName
      const typedNymName = toTypedNymName(nymName);
      const nymNameMsgHash = eip712MsgHash(
        typedNymName.domain,
        typedNymName.types,
        typedNymName.value,
      );
      const nymSig = ecsign(nymNameMsgHash, proverPrivKey);

      describe('prove and verify', () => {
        // Initialize prover
        const config = {
          witnessGenWasm: path.join(__dirname, '../../circuits/artifacts/nym_ownership.wasm'),
          circuitUrl: path.join(__dirname, '../../circuits/artifacts/nym_ownership.circuit'),
          enableProfiler: true,
        };
        const prover = new NymProver(config);
        const verifier = new NymVerifier(config);

        let post: Post;

        beforeAll(async () => {
          await prover.initWasm();

          const attestation = await prover.prove(
            nymName,
            content,
            toRpcSig(nymSig.v, nymSig.r, nymSig.s),
            toRpcSig(contentMessageSig.v, contentMessageSig.r, contentMessageSig.s),
            membershipProof,
          );

          post = toPost(content, attestation, AttestationScheme.Nym);
        });

        it('should  prove and verify a valid signature and Merkle proof', async () => {
          const proofValid = await verifier.verify(post);
          expect(proofValid).toBe(true);
        });

        it('should assert invalid attestation', async () => {
          post.attestation[0] = post.attestation[0] + 1;
          const proofValid = await verifier.verify(post);
          expect(proofValid).toBe(false);

          post.attestation[0] = post.attestation[0] - 1;
        });

        it('should assert if content.groupRoot != publicInput.root', async () => {
          const groupRoot = post.content.groupRoot;
          post.content.groupRoot = bigIntToPrefixedHex(BigInt(groupRoot) + BigInt(1));
          const proofValid = await verifier.verify(post);
          expect(proofValid).toBe(false);

          post.content.groupRoot = groupRoot;
        });

        it('should throw an error with a verbose message if the singer of the nymSig and contentSig are different', async () => {
          const privKey = proverPrivKey;
          privKey[0] += 1;
          let err: any;
          try {
            const nymSigAnotherSigner = ecsign(nymNameMsgHash, privKey);
            await prover.prove(
              nymName,
              content,
              toRpcSig(nymSigAnotherSigner.v, nymSigAnotherSigner.r, nymSigAnotherSigner.s),
              toRpcSig(contentMessageSig.v, contentMessageSig.r, contentMessageSig.s),
              membershipProof,
            );
          } catch (_err: any) {
            err = _err;
          }
          const nymSigner = `0x${privateToAddress(proverPrivKey).toString('hex')}` as PrefixedHex;
          expect(err.message).toBe(INCONSISTENT_SIGNERS(nymSigner, `0x${proverAddress}`));
        });

        it('should throw an error with a verbose message if the Merkle proof is invalid', async () => {
          let err: any;
          try {
            membershipProof.siblings[0][0] += BigInt(1);
            await prover.prove(
              nymName,
              content,
              toRpcSig(nymSig.v, nymSig.r, nymSig.s),
              toRpcSig(contentMessageSig.v, contentMessageSig.r, contentMessageSig.s),
              membershipProof,
            );
            membershipProof.siblings[0][0] -= BigInt(1);
          } catch (_err: any) {
            err = _err;
          }
          expect(err.message).toBe(INVALID_MERKLE_PROOF);
        });

        // TODO: test invalid public input
        // TODO: test invalid auxiliary
      });
    });

    describe('AttestationScheme = EIP712', () => {
      let post: Post;
      beforeAll(() => {
        const attestation = toCompactSig(
          contentMessageSig.v,
          contentMessageSig.r,
          contentMessageSig.s,
        );

        post = toPost(content, attestation, AttestationScheme.EIP712);
      });

      it('should verify a EIP712 attested content', () => {
        const singer = recoverPostPubkey(post);
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
