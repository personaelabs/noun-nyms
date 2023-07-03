import { splitNym } from '@/lib/client-utils';
import { PrefixedHex } from '@personaelabs/nymjs';
import { isAddress } from 'viem';
import { useEnsName } from 'wagmi';

const useName = ({ userId }: { userId?: string }) => {
  const isDoxed = !!(userId && isAddress(userId));
  const { data: ensName } = useEnsName({
    address: userId as PrefixedHex,
    enabled: isDoxed,
  });

  // If doxed, check ens. If ens, return ens. If not doxed, return nym name.
  const name = isDoxed ? ensName || userId : userId ? splitNym(userId).nymName + ' (pseudo)' : '';
  const isEns = !!(isDoxed && ensName);
  return { name, isEns, isDoxed };
};

export default useName;
