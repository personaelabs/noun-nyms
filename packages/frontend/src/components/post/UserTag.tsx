import { useAccount, useEnsName } from 'wagmi';
import { isAddress } from 'viem';
import Link from 'next/link';
import { UserAvatar } from '../global/UserAvatar';

interface UserTagProps {
  imgURL?: string;
  userId: string;
  date?: string;
}
export const UserTag = (props: UserTagProps) => {
  const { userId, date } = props;
  const isDoxed = isAddress(userId);

  const { address } = useAccount();
  const { data, isError, isLoading } = useEnsName({
    address,
    enabled: isDoxed,
  });

  return (
    // stop post modal from opening on click of user page link
    <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
      <Link href={`/users/${userId}`} className="flex gap-2 justify-center items-center">
        <UserAvatar userId={userId} width={30} />
        {isDoxed ? (
          data ? (
            <p className="font-semibold">{data}</p>
          ) : (
            <p className="font-semibold hover:underline">{userId}</p>
          )
        ) : (
          <p className="font-semibold hover:underline">{userId.split('-')[0]}</p>
        )}
      </Link>
      {date && (
        <>
          <p className="secondary">-</p>
          <p className="secondary whitespace-nowrap">{date}</p>
        </>
      )}
    </div>
  );
};
