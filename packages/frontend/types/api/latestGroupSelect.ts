import { Prisma } from '@prisma/client';

export const selectWithProofs = {
  address: true,
  pubkey: true,
  path: true,
  indices: true,
};

export const latestGroupSelectWithProofs = {
  ...selectWithProofs,
} satisfies Prisma.TreeNodeSelect;

type TreeNodeWithProofsGetPayload = Prisma.TreeNodeGetPayload<{
  select: typeof latestGroupSelectWithProofs;
}>;
export type ITreeNodeWithProofs = TreeNodeWithProofsGetPayload;

export const selectWithoutProofs = {
  address: true,
};

export const latestGroupSelectWithoutProofs = {
  ...selectWithoutProofs,
} satisfies Prisma.TreeNodeSelect;

type TreeNodeWithoutProofsGetPayload = Prisma.TreeNodeGetPayload<{
  select: typeof latestGroupSelectWithoutProofs;
}>;
export type ITreeNodeWithoutProofs = TreeNodeWithoutProofsGetPayload;
