import { ContentUserInput } from '@/types/components';
import {
  AttestationScheme,
  CONTENT_MESSAGE_TYPES,
  Content,
  DOMAIN,
  NymProver,
  UPVOTE_TYPES,
  toTypedNymName,
  MerkleProof,
} from '@personaelabs/nymjs';
import axiosBase from 'axios';
import { getLatestGroup, getPubKeyFromEIP712Sig } from './client-utils';

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

export const postDoxed = async (
  doxedContentInput: ContentUserInput,
  signTypedDataAsync: any,
  onSigned?: () => void,
) => {
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

  // Call handler once user has signed the post
  if (onSigned) onSigned();

  return await submitPost(content, attestation, AttestationScheme.EIP712);
};

export const postPseudo = async (
  nymProver: NymProver,
  nymName: string,
  nymSig: any,
  nymContentInput: ContentUserInput,
  signTypedDataAsync: any,
  onSigned?: () => void,
) => {
  if (nymName && nymSig) {
    const group = await getLatestGroup();
    const typedNymName = toTypedNymName(nymName);
    const userPubKey = getPubKeyFromEIP712Sig(typedNymName, nymSig);
    console.log({ userPubKey });

    // Get the user's merkle proof
    const userMerkleProof = group.members.find((member) => member.pubkey === userPubKey);

    // Throw if merkle proof not found (implies user not in set)
    if (!userMerkleProof) {
      throw new Error('User not found in set');
    }
    const merkleProof: MerkleProof = {
      pathIndices: userMerkleProof?.indices,
      // TODO: Figure out why 0x is needed here.
      siblings: userMerkleProof?.path.map((sibling) => {
        return [BigInt('0x' + sibling)];
      }),
      root: BigInt(group.root),
    };
    console.log('merkle proof', merkleProof);
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

    // Call handler once user has signed the post
    if (onSigned) onSigned();

    // Generate the proof
    const attestation = await nymProver.prove(
      nymName,
      content,
      nymSig as string,
      contentSig as string,
      merkleProof,
    );

    const attestationHex = Buffer.from(attestation).toString('hex');

    return await submitPost(content, attestationHex, AttestationScheme.Nym);
  }
};

export const submitUpvote = async (postId: string, signTypedDataAsync: any) => {
  const group = await getLatestGroup();

  const upvote = {
    postId: postId,
    groupRoot: group.root,
    timestamp: Math.round(Date.now() / 1000),
  };

  const sig = await signTypedDataAsync({
    primaryType: 'Upvote',
    domain: DOMAIN,
    types: UPVOTE_TYPES,
    message: upvote,
  });

  await axios.post(`/posts/${postId}/upvote`, {
    groupRoot: upvote.groupRoot,
    timestamp: upvote.timestamp,
    sig,
  });
};
