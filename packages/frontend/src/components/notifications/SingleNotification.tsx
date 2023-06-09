import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UserAvatar } from '../global/UserAvatar';
import {
  faCheck,
  faCircleUp,
  faEllipsis,
  faReply,
  faReplyAll,
} from '@fortawesome/free-solid-svg-icons';
import { UserName } from '../global/UserName';
import { fromNowDate, trimText } from '@/lib/example-utils';
import { NotificationType, Notification, setReadArgs } from '@/types/notifications';
import { useState } from 'react';
import { useAccount } from 'wagmi';

const getNotificationFromType = (type: NotificationType) => {
  switch (type) {
    case NotificationType.DirectReply:
      return { icon: faReply, text: 'Replied to you: ' };
    case NotificationType.DiscussionReply:
      return { icon: faReplyAll, text: 'Replied to your post: ' };
    default:
      return { icon: faCircleUp, text: 'Upvoted: ' };
  }
};

export const SingleNotification = (props: {
  n: Notification;
  setAsRead: (args: setReadArgs) => void;
  trim?: boolean;
}) => {
  const { address } = useAccount();
  const { n, setAsRead, trim } = props;
  const [showOptions, setShowOptions] = useState(false);

  return (
    <>
      <div className="shrink-0 h-min relative">
        <div className="flex gap-2 items-center">
          <div className={`w-2.5 h-2.5 ${n.read ? 'bg-white' : 'bg-[#0E76FD]'} rounded-full`} />
          <UserAvatar userId={n.userId} width={35} />
          <div className="absolute bottom-0 left-full -translate-x-full flex items-center justify-center bg-[#0E76FD] rounded-full p-1 w-[15px] h-[15px]">
            <FontAwesomeIcon
              icon={getNotificationFromType(n.type).icon}
              size={'2xs'}
              color={'#ffffff'}
            />
          </div>
        </div>
      </div>
      <div className="min-w-0 shrink grow flex flex-col gap-2">
        <div className="w-full flex gap-2 items-center">
          <p className="breakText">
            <span className="postDetail">
              <UserName userId={n.userId} trim={true} />
            </span>
            <span className="secondary"> on </span>
            <span className="postDetail">{n.title}</span>
          </p>
          <p className="secondary">-</p>
          <p className="shrink-0 secondary">{fromNowDate(n.timestamp)}</p>
        </div>
        <p>
          <span>{getNotificationFromType(n.type).text}</span>
          <span>{trim ? trimText(n.body) : n.body}</span>
        </p>
      </div>
      <div
        className="relative px-1 hover:bg-gray-200 rounded-md"
        onClick={(e) => {
          e.stopPropagation();
          setShowOptions(!showOptions);
        }}
      >
        <FontAwesomeIcon icon={faEllipsis} />
        {showOptions && (
          <div
            className="absolute top-full right-1/2 mt-2 shadow-sm border border-gray-200 bg-white hover:bg-gray-100 rounded-xl p-2 w-max flex gap-2 items-center"
            onClick={() => setAsRead({ address, id: n.id })}
          >
            <FontAwesomeIcon icon={faCheck} size={'sm'} />
            <p>Mark as read</p>
          </div>
        )}
      </div>
    </>
  );
};
