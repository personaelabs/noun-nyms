import { UserAvatar } from '../global/UserAvatar';
import useName from '@/hooks/useName';
import { NameType } from '@/types/components';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

interface UserTagProps {
  userId: string;
  avatarWidth?: number;
  timestamp?: Date;
  lastActive?: Date | null;
  hideLink?: boolean;
}
export const UserTag = (props: UserTagProps) => {
  const { userId, avatarWidth, timestamp, lastActive, hideLink } = props;
  const { name, isDoxed } = useName({ userId });

  return (
    // stop post modal from opening on click of user page link
    <div className="flex gap-2 items-center flex-wrap" onClick={(e) => e.stopPropagation()}>
      <UserAvatar
        type={isDoxed ? NameType.DOXED : NameType.PSEUDO}
        userId={userId}
        width={avatarWidth || 30}
      />
      <div className="flex flex-col gap-1 shrink overflow-hidden">
        {hideLink ? (
          <p className="overflow-hidden text-ellipsis whitespace-nowrap font-semibold">{name}</p>
        ) : (
          <a href={`/users/${userId}`} className="outline-none overflow-hidden">
            <p className="text-ellipsis whitespace-nowrap font-semibold hover:underline">{name}</p>
          </a>
        )}

        {lastActive && (
          <div className="flex gap-1 shrink-0 secondary">
            <p>Last active </p>
            <p className="font-semibold">{dayjs(lastActive).fromNow()}</p>
          </div>
        )}
      </div>

      {timestamp && (
        <div className="flex gap-2 shrink-0">
          <p className="secondary">-</p>
          <p className="secondary">{dayjs(timestamp).fromNow()}</p>
        </div>
      )}
    </div>
  );
};
