import { UserAvatar } from '../global/UserAvatar';
import useName from '@/hooks/useName';
import { NameType } from '@/types/components';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

interface UserTagProps {
  userId: string;
  timestamp?: Date;
}
export const UserTag = (props: UserTagProps) => {
  const { userId, timestamp } = props;
  const { name, isDoxed } = useName({ userId });

  return (
    // stop post modal from opening on click of user page link
    <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
      <a href={`/users/${userId}`} className="outline-none flex gap-2 justify-center items-center">
        <UserAvatar type={isDoxed ? NameType.DOXED : NameType.PSEUDO} userId={userId} width={30} />
        <p className="font-semibold hover:underline">{name}</p>
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
