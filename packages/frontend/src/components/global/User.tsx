import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import useUser from '@/hooks/useUser';

export function User() {
  const { address } = useAccount();
  const { onAddressChange } = useUser();

  useEffect(() => {
    console.log(`in User.tsx effect`);
    if (address) {
      onAddressChange(address);
    }
  }, [address, onAddressChange]);

  return <></>;
}
