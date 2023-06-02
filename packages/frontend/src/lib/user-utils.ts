import { PublicClient, isAddress } from 'viem';
import { getEnsName } from 'viem/ens';

export const getUserNameFromId = async (
  client: PublicClient,
  userId: string,
): Promise<{ name: string; isDoxed: boolean }> => {
  const isDoxed = !!(userId && isAddress(userId));
  // If doxed, check ens. If ens, return ens. If not doxed, return nym name.
  const name = isDoxed
    ? (await getEnsName(client, { address: userId as `0x${string}` })) || userId
    : userId?.split('-')[0];

  return { name, isDoxed };
};
