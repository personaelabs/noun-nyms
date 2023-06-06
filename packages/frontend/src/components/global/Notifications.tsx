import {
  faBell,
  faCheck,
  faCircleUp,
  faReply,
  faReplyAll,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useNotifications, { notificationsListToMap } from '@/hooks/useNotifications';
import { Menu } from '@headlessui/react';
import { NotificationType, UserContextType } from '@/types/components';
import { UserAvatar } from './UserAvatar';
import Spinner from './Spinner';
import { fromNowDate, trimText } from '@/lib/example-utils';
import { UserName } from './UserName';
import { setNotificationsInLocalStorage } from '@/hooks/useNotifications';
import { useAccount } from 'wagmi';
import { useContext, useMemo, useState } from 'react';
import { UserContext } from '@/pages/_app';
import { Filters } from '../post/Filters';

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
  const { address } = useAccount();
  const { isMobile, pushRoute } = useContext(UserContext) as UserContextType;
  const { notifications, setNotifications, isLoading } = useNotifications({ enabled: true });
  const [filter, setFilter] = useState('all');

  const unreadNotifications = useMemo(() => {
    return notifications ? notifications.filter((n) => n.read === false) : [];
  }, [notifications]);

  const notificationsToShow = useMemo(
    () => (filter === 'unread' ? unreadNotifications : notifications)?.slice(0, 5),
    [filter, notifications, unreadNotifications],
  );

  const filters = {
    all: 'All',
    unread: 'Unread',
  };

  const setNotificationAsRead = (id: string) => {
    if (notifications) {
      // update notifications in memory
      const newNotifications = notifications.map((n) => {
        if (n.id === id) return { ...n, read: true };
        return n;
      });
      setNotifications(newNotifications);
      const map = notificationsListToMap(newNotifications);
      // write new map to local storage
      setNotificationsInLocalStorage(address as string, map);
    }
  };

  const MarkAllAsRead = () => {
    if (notifications) {
      // update notifications in memory
      const newNotifications = notifications.map((n) => {
        return { ...n, read: true };
      });
      setNotifications(newNotifications);
      const map = notificationsListToMap(newNotifications);
      // write new map to local storage
      setNotificationsInLocalStorage(address as string, map);
    }
  };

  return (
    <>
      <Menu as={'div'} className="cursor-pointer static md:relative">
        {({ close }) => (
          <>
            <Menu.Button
              className="relative hover:scale-105 active:scale-100 transition-all"
              onClick={() => {
                if (isMobile) pushRoute('/notifications');
              }}
            >
              <FontAwesomeIcon icon={faBell} size={'2xl'} color={'#ffffff'} />
              {unreadNotifications.length > 0 && (
                <div className="absolute bottom-full left-full translate-y-3/4 -translate-x-3/4 rounded-full w-4 h-4 bg-red-700" />
              )}
            </Menu.Button>
            {!isMobile && (
              <Menu.Items className="absolute z-50 top-full left-1/2 -translate-x-1/2 w-[400px] bg-white mt-6 border border-gray-200 rounded-xl cursor-pointer">
                <div className="flex flex-col gap-2 px-3 mb-2">
                  <div className="flex items-center justify-between mt-2">
                    <h4>Notifications</h4>
                    <FontAwesomeIcon icon={faXmark} size={'lg'} color="#98A2B3" onClick={close} />
                  </div>
                  <div className="flex justify-between items-center">
                    <Filters
                      filters={filters}
                      selectedFilter={filter}
                      setSelectedFilter={setFilter}
                    />
                    <div
                      className="flex gap-1 justify-end items-center mb-2"
                      onClick={MarkAllAsRead}
                    >
                      <FontAwesomeIcon icon={faCheck} size={'xs'} />
                      <p className="secondary hover:underline">Mark all as read</p>
                    </div>
                  </div>
                </div>
                {notificationsToShow && notificationsToShow.length > 0 ? (
                  <>
                    {notificationsToShow.map((n, i) => {
                      return (
                        <Menu.Item
                          as={'div'}
                          key={i}
                          className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-200 ${
                            n.read ? 'bg-white' : 'bg-gray-100'
                          }`}
                          onClick={() => {
                            setNotificationAsRead(n.id);
                            // pushRoute(`/posts/${n.id}`);
                          }}
                        >
                          <div className="shrink-0 relative">
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
                            <div className="w-full flex gap-1 items-center">
                              <p className="breakText">
                                <span className="postDetail">
                                  <UserName userId={n.userId} trim={true} />
                                </span>
                                <span className="secondary"> on </span>
                                <span className="postDetail">{n.title}</span>
                              </p>
                              <p className="shrink-0 secondary">{fromNowDate(n.timestamp)}</p>
                            </div>
                            <p>
                              <span>{getNotificationFromType(n.type).text}</span>
                              <span>{trimText(n.body)}</span>
                            </p>
                          </div>
                        </Menu.Item>
                      );
                    })}
                    <Menu.Item
                      as={'div'}
                      className="py-2 hover:bg-gray-200 rounded-xl"
                      onClick={() => pushRoute('/notifications')}
                    >
                      <p className="text-center">See All</p>
                    </Menu.Item>
                  </>
                ) : isLoading ? (
                  <div className="p-4">
                    <Spinner />
                  </div>
                ) : (
                  <p className="p-4 text-center">No notifications</p>
                )}
              </Menu.Items>
            )}
          </>
        )}
      </Menu>
    </>
  );
};
