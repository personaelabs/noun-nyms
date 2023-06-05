import {
  faBell,
  faCheck,
  faCircleUp,
  faReply,
  faReplyAll,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useNotifications from '@/hooks/useNotifications';
import { Menu } from '@headlessui/react';
import { NameType, NotificationType, ReplyNotification } from '@/types/components';
import { UserAvatar } from './UserAvatar';
import Spinner from './Spinner';
import { fromNowDate } from '@/lib/example-utils';
import { UserName } from './UserName';

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

export const Notifications = () => {
  const { notifications, isLoading } = useNotifications();
  return (
    <>
      <Menu as={'div'} className="cursor-pointer static md:relative">
        {({ close }) => (
          <>
            <Menu.Button className="hover:scale-105 active:scale-100 transition-all">
              <FontAwesomeIcon icon={faBell} size={'2xl'} color={'#ffffff'} />
            </Menu.Button>
            <Menu.Items className="absolute z-50 top-0 md:top-full left-1/2 -translate-x-1/2 w-screen md:w-[400px] bg-white m-0 md:mt-6 border border-gray-200 rounded-xl cursor-pointer">
              <div className="flex items-center justify-between px-3 py-2">
                <h4>Notifications</h4>
                <FontAwesomeIcon icon={faXmark} size={'lg'} color="#98A2B3" onClick={close} />
              </div>
              <div
                className="flex gap-1 justify-end items-center mb-2 px-3"
                onClick={() => console.log('mark all as read here')}
              >
                <FontAwesomeIcon icon={faCheck} size={'xs'} />
                <p className="secondary underline">Mark all as read</p>
              </div>
              {notifications && notifications.length > 0 ? (
                notifications.map((n, i) => {
                  return (
                    <Menu.Item
                      as={'div'}
                      key={i}
                      className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 ${
                        n.read ? 'bg-white' : 'bg-gray-100'
                      }`}
                      onClick={() => console.log('push route to notifications here')}
                    >
                      <div className="shrink-0 relative">
                        <UserAvatar type={NameType.PSEUDO} userId={n.userId} width={35} />
                        <div className="absolute bottom-0 left-full -translate-x-full flex items-center justify-center bg-[#0E76FD] rounded-full p-1 w-[15px] h-[15px]">
                          <FontAwesomeIcon
                            icon={getNotificationFromType(n.type).icon}
                            size={'2xs'}
                            color={'#ffffff'}
                          />
                        </div>
                      </div>
                      <div className="min-w-0 shrink grow flex flex-col gap-2">
                        <div className="w-full flex gap-1 items-center">
                          <p className="breakText">
                            <span className="postDetail">
                              <UserName userId={n.userId} />
                            </span>
                            <span className="secondary"> on </span>
                            <span className="postDetail">{n.body}</span>
                          </p>
                          <p className="shrink-0 secondary">{fromNowDate(n.timestamp)}</p>
                        </div>
                        <p>
                          <span>{getNotificationFromType(n.type).text}</span>
                          <span>{n.type === NotificationType.Upvote ? n.body : n.body}</span>
                        </p>
                      </div>
                    </Menu.Item>
                  );
                })
              ) : isLoading ? (
                <Spinner />
              ) : (
                <p className="p-4 text-center">No notifications</p>
              )}
            </Menu.Items>
          </>
        )}
      </Menu>
    </>
  );
};
