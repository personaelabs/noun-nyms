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
