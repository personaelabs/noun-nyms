import useName from '@/hooks/useName';

interface UserAvatarProps {
  userId: string;
}

export const UserName = (props: UserAvatarProps) => {
  const { userId } = props;

  // If ens + avatar exists, return image
  const { name } = useName({ userId });
  return name ? <span>{name}</span> : <></>;
};
