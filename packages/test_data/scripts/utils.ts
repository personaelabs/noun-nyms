import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const treeExists = async (root: string): Promise<boolean> =>
  (await prisma.tree.findFirst({
    where: {
      root,
    },
  }))
    ? true
    : false;
