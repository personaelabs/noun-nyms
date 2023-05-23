import { PrefixedHex } from '@personaelabs/nymjs';
import { isAddress } from 'viem';
import { useEnsName } from 'wagmi';

const useName = ({ userId }: { userId: string }) => {
  const isDoxed = isAddress(userId);
  const { data: ensName } = useEnsName({
    address: userId as PrefixedHex,
    enabled: isDoxed,
  });
  // If doxed, check ens. If ens, return ens. If not doxed, return nym name.
  return isDoxed ? ensName || userId : userId.split('-')[0];
};

export default useName;
