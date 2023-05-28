import { useAccount } from 'wagmi';
import useUser from '@/hooks/useUser';

export function User() {
  const { address } = useAccount();
  const { isValid } = useUser(address);

  return <></>;
}
