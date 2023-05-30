import { PrefixedHex } from './types';

export const INCONSISTENT_SIGNERS = (
  nymSigner: PrefixedHex,
  contentSinger: PrefixedHex,
): string => {
  return `Signer of the nym (${nymSigner}) does not match the signer of the content (${contentSinger})`;
};
export const INVALID_MERKLE_PROOF = 'Invalid Merkle proof';
