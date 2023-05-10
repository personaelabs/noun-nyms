import { deserializeNymAttestation } from '@personaelabs/nymjs';
import prisma from '../../../lib/prisma';

export const verifyInclusion = async (pubkey: string): Promise<boolean> => {
  const node = await prisma.treeNode.findFirst({
    where: {
      pubkey,
    },
  });

  return node ? true : false;
};

export const isNymValid = (nym: string): boolean => {
  const [_nymCode, nymHash] = nym.split('-');
  console.log('nymHash.length', nymHash.length);
  return nymHash.length === 64;
};

// Maybe move this into nymjs
export const getNymFromAttestation = (attestation: Buffer): string => {
  const {
    nymCode,
    publicInput: { nymHash },
  } = deserializeNymAttestation(attestation);
  const nym = `${nymCode}-${nymHash}`;
  return nym;
};

type Post = {
  id: string;
  rootId: string;
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
