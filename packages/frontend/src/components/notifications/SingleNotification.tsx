import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UserAvatar } from '../global/UserAvatar';
import { faCircleUp, faEllipsis, faReply, faReplyAll } from '@fortawesome/free-solid-svg-icons';
import { UserName } from '../global/UserName';
import { fromNowDate } from '@/lib/example-utils';
import { NotificationType, Notification } from '@/types/notifications';

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

export const SingleNotification = (props: { n: Notification }) => {
  const { n } = props;
  return (
    <>
      <div className="shrink-0 h-min relative">
        <UserAvatar userId={n.userId} width={35} />
        <div className="absolute bottom-0 left-full -translate-x-full flex items-center justify-center bg-[#0E76FD] rounded-full p-1 w-[15px] h-[15px]">
          <FontAwesomeIcon
            icon={getNotificationFromType(n.type).icon}
            size={'2xs'}
            color={'#ffffff'}
          />
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
          <span>{n.body}</span>
        </p>
      </div>
      <div className="px-1 hover:bg-gray-200 rounded-md">
        <FontAwesomeIcon icon={faEllipsis} />
      </div>
    </>
  );
};
