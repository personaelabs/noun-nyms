import { deserializeNymAttestation } from '@personaelabs/nymjs';
import prisma from '@/lib/prisma';
import { postPreviewSelect } from '@/types/api';
import { createPublicClient, http, isAddress } from 'viem';
import { GetServerSidePropsContext } from 'next';
import { IPostSimple, postSelectSimple } from '@/types/api/postSelectSimple';
import { mainnet } from 'viem/chains';

export const verifyInclusion = async (pubkey: string): Promise<boolean> => {
  const node = await prisma.treeNode.findFirst({
    where: {
      pubkey,
    },
  });

  return node ? true : false;
};

export const isNymValid = (nym: string): boolean => {
  const [_nymName, nymHash] = nym.split('-');
  return nymHash.length === 64;
};

// Maybe move this into nymjs
export const getNymFromAttestation = (attestation: Buffer): string => {
  const {
    nymName,
    publicInput: { nymHash },
  } = deserializeNymAttestation(attestation);
  const nym = `${nymName}-${nymHash.toString(16)}`;
  return nym;
};

export const findPost = async (
  postId: string,
): Promise<{
  rootId: string | null;
}> => {
  const result = await prisma.post.findFirst({
    select: {
      rootId: true,
    },
    where: {
      id: postId,
    },
  });

  return result as { rootId: string | null };
};

export const getRootFromParent = async (parentId: string): Promise<string | null> => {
  let rootId;
  if (parentId === '0x0') {
    // If there is no parent (i.e. it's a root post) then set the rootId to "0x0".
    rootId = null;
  } else {
    const parent = await findPost(parentId);
    if (parent.rootId === null) {
      // If the rootId of the parent is "0x0", the parent will be the root.
      rootId = parentId;
    } else {
      // If the rootId of the parent is specified, then inherit that rootId.
      rootId = parent.rootId;
    }
  }

  return rootId;
};

export const selectAndCleanPosts = async (userId?: string, skip?: number, take?: number) => {
  const isNym = userId && !isAddress(userId);
  // Determines whether we are searching for a user's posts or all root posts.
  const where = userId ? { userId: isNym ? userId : userId.toLowerCase() } : { rootId: null };
  const postsRaw = await prisma.post.findMany({
    select: postPreviewSelect,
    where,
    skip,
    take,
    orderBy: {
      timestamp: 'desc',
    },
  });

  return postsRaw;
};

export const upvoteExists = async (postId: string, address: string): Promise<boolean> => {
  const upvote = await prisma.doxedUpvote.findFirst({
    where: {
      postId,
      address,
    },
  });

  return upvote ? true : false;
};

export const isTimestampValid = (timestamp: number): boolean => {
  const now = Math.floor(Date.now() / 1000);
  return Math.abs(now - timestamp) < 100;
};

export const getSimplePost = async (
  context: GetServerSidePropsContext,
): Promise<{ props: { post: IPostSimple | null } }> => {
  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(),
  });

  const id = context.query.postId;

  let postSimple = await prisma.post.findFirst({
    select: postSelectSimple,
    where: {
      id: id as string,
    },
  });
  if (postSimple) {
    const post: IPostSimple = {
      title: postSimple.title,
      body: postSimple.body,
      timestamp: postSimple.timestamp.getTime(),
      name: postSimple.userId,
      id: postSimple.id,
      userId: postSimple.userId,
    };

    if (isAddress(postSimple.userId)) {
      const ensName = await publicClient.getEnsName({
        address: postSimple.userId,
      });
      if (ensName) post.name = ensName;
    }
    return {
      props: {
        post,
      },
    };
  } else {
    return {
      props: {
        post: null,
      },
    };
  }
};
