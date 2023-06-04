import { UserContext } from '@/pages/_app';
import { UserAvatar } from '../global/UserAvatar';
import useName from '@/hooks/useName';
import { NameType, UserContextType } from '@/types/components';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useContext } from 'react';
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
  const { isMobile, pushRoute } = useContext(UserContext) as UserContextType;

  return (
    <>
      <div
        className="min-w-0 shrink grow basis-2/3 max-w-full flex gap-2 items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <UserAvatar
          type={isDoxed ? NameType.DOXED : NameType.PSEUDO}
          userId={userId}
          width={avatarWidth || 30}
        />
        <div className="min-w-0 flex flex-col gap-1">
          {hideLink ? (
            <p className="font-semibold breakText">{name}</p>
          ) : (
            <div
              className="font-semibold hover:underline breakText outline-none"
              onClick={() => pushRoute(`/users/${userId}`)}
            >
              {name}
            </div>
          )}

          {lastActive && (
            <div className="flex gap-1 shrink-0 secondary">
              {!isMobile && <p>Last active </p>}
              <p className="font-semibold">{dayjs(lastActive).fromNow()}</p>
            </div>
          )}
        </div>

        {timestamp && (
          <div className="shrink-0 flex gap-2">
            <p className="secondary">-</p>
            <p className="secondary">{dayjs(timestamp).fromNow()}</p>
          </div>
        )}
      </div>
    </>
  );
};
