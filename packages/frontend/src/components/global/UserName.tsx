import useName from '@/hooks/useName';
import { trimAddress } from '@/lib/client-utils';

interface UserAvatarProps {
  userId: string;
  trim?: boolean;
}

export const UserName = (props: UserAvatarProps) => {
  const { userId, trim } = props;

  // If ens + avatar exists, return image
  const { name, isEns, isDoxed } = useName({ userId });
  const shouldTrim = !isEns && isDoxed && trim;
  return name ? <span>{shouldTrim ? trimAddress(name) : name}</span> : <></>;
};
