import { useEnsAvatar } from 'wagmi';

const useAvatar = ({ name }: { name: string }) => {
  const {
    data: avatarUrl,
    isError,
    isLoading,
  } = useEnsAvatar({
    name,
  });
  return { avatarUrl, isError, isLoading };
};

export default useAvatar;
