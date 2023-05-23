import { UserAvatar } from '../global/UserAvatar';
import useName from '@/hooks/useName';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

interface UserTagProps {
  userId: string;
  timestamp?: Date;
}
export const UserTag = (props: UserTagProps) => {
  const { userId, timestamp } = props;
  const name = useName({ userId });

  return (
    // stop post modal from opening on click of user page link
    <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
      <a href={`/users/${userId}`} className="outline-none flex gap-2 justify-center items-center">
        <UserAvatar userId={userId} width={30} />
        <p className="font-semibold on:hover">{name}</p>
      </a>
      {timestamp && (
        <div className="flex gap-2 shrink-0">
          <p className="secondary">-</p>
          <p className="secondary">{dayjs(timestamp).fromNow()}</p>
        </div>
      )}
    </div>
  );
};
