import { useAccount, useEnsName } from 'wagmi';
import { isAddress } from 'viem';
import Link from 'next/link';
import { UserAvatar } from '../global/UserAvatar';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

interface UserTagProps {
  userId: string;
  timestamp?: Date;
}
export const UserTag = (props: UserTagProps) => {
  const { userId, timestamp } = props;
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
      {timestamp && (
        <>
          <p className="secondary">-</p>
          <p className="secondary">{dayjs(timestamp).fromNow()}</p>
        </>
      )}
    </div>
  );
};
