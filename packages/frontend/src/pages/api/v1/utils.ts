import prisma from '../../../lib/prisma';

export const verifyInclusion = async (pubkey: string): Promise<boolean> => {
  const node = await prisma.treeNode.findFirst({
    where: {
      pubkey,
    },
  });

  return node ? true : false;
};
