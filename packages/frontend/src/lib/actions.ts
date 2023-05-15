import { ContentUserInput } from '@/types/components';
import {
  AttestationScheme,
  CONTENT_MESSAGE_TYPES,
  Content,
  DOMAIN,
  NymProver,
  toTypedNymName,
} from '@personaelabs/nymjs';
import axiosBase from 'axios';
import { getLatestGroup, getPubKeyFromEIP712Sig } from './example-utils';
import { MerkleProof } from '@personaelabs/spartan-ecdsa';

const axios = axiosBase.create({
  baseURL: `/api/v1`,
});

export const submitPost = async (
  content: Content,
  attestation: string,
  attestationScheme: AttestationScheme,
) => {
  const result = await axios.post(`/posts`, {
    content,
    attestation,
    attestationScheme,
  });

  return result;
};

export const postDoxed = async (doxedContentInput: ContentUserInput, signTypedDataAsync: any) => {
  const group = await getLatestGroup();

  // Construct the content to sign
  const content: Content = {
    venue: 'nouns',
    title: doxedContentInput.title,
    body: doxedContentInput.body,
    parentId: doxedContentInput.parentId ? doxedContentInput.parentId : '0x0',
    groupRoot: group.root,
    timestamp: Math.round(Date.now() / 1000),
  };

  // Request the user to sign the content
  const attestation = await signTypedDataAsync({
    primaryType: 'Post',
    domain: DOMAIN,
    types: CONTENT_MESSAGE_TYPES,
    message: content,
  });

  const result = await submitPost(content, attestation, AttestationScheme.EIP712);

  console.log('Created a non-pseudonymous post! postId', result.data.postId);
};

export const postPseudo = async (
  nymName: string,
  nymSig: any,
  nymContentInput: ContentUserInput,
  signTypedDataAsync: any,
) => {
  if (nymName && nymSig) {
    const group = await getLatestGroup();
    const typedNymName = toTypedNymName(nymName);
    const userPubKey = getPubKeyFromEIP712Sig(typedNymName, nymSig);

    // Get the user's merkle proof
    const userMerkleProof = group.members.find((member) => member.pubkey === userPubKey);

    // Throw if merkle proof not found (implies user not in set)
    if (!userMerkleProof) {
      throw new Error('User not found in set');
    }

    const merkleProof: MerkleProof = {
      pathIndices: userMerkleProof?.indices,
      siblings: userMerkleProof?.path.map((sibling) => BigInt(sibling)),
      root: BigInt(group.root),
    };

    // Construct the content to sign
    const content: Content = {
      venue: 'nouns',
      title: nymContentInput.title,
      body: nymContentInput.body,
      parentId: nymContentInput.parentId ? nymContentInput.parentId : '0x0',
      groupRoot: group.root,
      timestamp: Math.round(Date.now() / 1000),
    };

    // Request the user to sign the content
    const contentSig = await signTypedDataAsync({
      primaryType: 'Post',
      domain: DOMAIN,
      types: CONTENT_MESSAGE_TYPES,
      message: content,
    });

    // Setup the prover
    const nymProver = new NymProver({
      enableProfiler: true,
    });

    await nymProver.initWasm();

    // Generate the proof
    const attestation = await nymProver.prove(
      nymName,
      content,
      nymSig as string,
      contentSig as string,
      merkleProof,
    );

    const attestationHex = Buffer.from(attestation).toString('hex');

    const result = await submitPost(content, attestationHex, AttestationScheme.Nym);
    console.log('Created a pseudonymous post! postId', result.data.postId);
  }
};
