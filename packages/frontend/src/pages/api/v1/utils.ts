import { deserializeNymAttestation } from '@personaelabs/nymjs';
import prisma from '@/lib/prisma';
import { IUser, postPreviewSelect } from '@/types/api';
import { createPublicClient, http, isAddress } from 'viem';
import { GetServerSidePropsContext } from 'next';
import { IPostSimple, postSelectSimple } from '@/types/api/postSelectSimple';
import { mainnet } from 'viem/chains';
import { splitNym } from '@/lib/client-utils';

export const verifyInclusion = async (pubkey: string): Promise<boolean> => {
  const node = await prisma.treeNode.findFirst({
    where: {
      pubkey,
    },
  });

  return node ? true : false;
};

export const isNymValid = (nym: string): boolean => {
  const { nymHash } = splitNym(nym);
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

export const getPostDepthFromParent = async (parentId: string): Promise<number> => {
  if (parentId === '0x0') {
    return 0;
  }

  const parent = await prisma.post.findFirst({
    select: {
      depth: true,
    },
    where: {
      id: parentId,
    },
  });

  if (!parent) {
    // Here we assume that the parent exists, so if it doesn't, throw an error.
    throw new Error(`Parent not found in getPostDepthFromParent. parentId: ${parentId})`);
  }

  return parent.depth + 1;
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

export const selectAndCleanPosts = async (
  userId?: string,
  skip?: number,
  take?: number,
  sort?: string,
) => {
  const isNym = userId && !isAddress(userId);
  // Determines whether we are searching for a user's posts or all root posts.
  const where = userId ? { userId: isNym ? userId : userId.toLowerCase() } : { rootId: null };
  const postsRaw = await prisma.post.findMany({
    select: postPreviewSelect,
    where,
    skip,
    take,
    orderBy:
      sort === 'upvotes'
        ? [
            { descendants: { _count: 'desc' } },
            { root: { descendants: { _count: 'desc' } } },
            { upvotes: { _count: 'desc' } },
          ]
        : { timestamp: 'desc' },
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

export const userIdToName = async (userId: string) => {
  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(),
  });

  if (isAddress(userId)) {
    const ensName = await publicClient.getEnsName({
      address: userId,
    });
    return ensName || userId;
  } else {
    return splitNym(userId).nymName;
  }
};

export const getSimplePost = async (
  context: GetServerSidePropsContext,
): Promise<{ props: { post: IPostSimple | null } }> => {
  const id = context.query.postId;

  let postSimple = await prisma.post.findFirst({
    select: postSelectSimple,
    where: {
      id: id as string,
    },
  });

  let post: IPostSimple | null = null;

  if (postSimple) {
    const simple: IPostSimple = {
      title: postSimple.title,
      body: postSimple.body,
      timestamp: postSimple.timestamp.getTime(),
      name: await userIdToName(postSimple.userId),
      id: postSimple.id,
      userId: postSimple.userId,
    };

    post = simple;
  }
  return { props: { post: post } };
};

// Count total number of
export const getSimpleUser = async (
  context: GetServerSidePropsContext,
): Promise<{ props: { user: IUser | null } }> => {
  const userId = context.query.userId as string;
  let user: IUser | null = null;
  if (userId) {
    const totalPosts = await prisma.post.count({
      where: { userId },
    });
    const upvotesReceived = await prisma.doxedUpvote.count({
      where: {
        post: {
          userId,
        },
      },
    });
    user = { userId, totalPosts, upvotesReceived, name: await userIdToName(userId) };
  }

  return { props: { user: user } };
};
