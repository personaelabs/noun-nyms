import { faBell, faCheck, faRefresh, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNotifications } from '@/hooks/useNotifications';
import { Menu } from '@headlessui/react';
import Spinner from '../global/Spinner';
import { useAccount } from 'wagmi';
import { useContext, useMemo, useState } from 'react';
import { UserContext } from '@/pages/_app';
import { Filters } from '../post/Filters';
import { SingleNotification } from './SingleNotification';
import { RefreshNotifications } from './RefreshNotifications';
import { UserContextType } from '@/types/components';

export const Notifications = () => {
  const { address } = useAccount();
  const { isMobile, nymOptions, pushRoute } = useContext(UserContext) as UserContextType;
  const { notifications, unread, isLoading, setNotificationsAsRead } = useNotifications();
  const [filter, setFilter] = useState('all');

  const notificationsToShow = useMemo(
    () =>
      (filter === 'unread' ? notifications?.filter((n) => !n.read) : notifications)?.slice(0, 5),
    [filter, notifications],
  );

  const filters = {
    all: 'All',
    unread: 'Unread',
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
              {unread.length > 0 && (
                <div className="absolute bottom-full left-full translate-y-3/4 -translate-x-3/4 rounded-full w-4 h-4 bg-red-700" />
              )}
            </Menu.Button>
            {!isMobile && (
              <Menu.Items className="absolute z-50 top-full left-1/2 -translate-x-1/2 w-[400px] bg-white mt-6 border border-gray-200 rounded-xl cursor-pointer">
                <div className="flex flex-col gap-2 px-3 mb-2">
                  <div className="flex items-center justify-between mt-2">
                    <h4>Notifications</h4>
                    <div className="flex gap-3">
                      <RefreshNotifications nymOptions={nymOptions} />
                      <FontAwesomeIcon icon={faXmark} size={'lg'} color="#98A2B3" onClick={close} />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <Filters
                      filters={filters}
                      selectedFilter={filter}
                      setSelectedFilter={setFilter}
                    />
                    <div
                      className="flex gap-1 justify-end items-center"
                      onClick={() => setNotificationsAsRead(address, '', true)}
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
                            setNotificationsAsRead(address, n.id);
                            pushRoute(`/posts/${n.postId}`);
                          }}
                        >
                          <SingleNotification n={n} />
                        </Menu.Item>
                      );
                    })}
                    <Menu.Item
                      as={'div'}
                      className="py-2 hover:underline"
                      onClick={() => pushRoute('/notifications')}
                    >
                      <p className="text-center">See All Notifications</p>
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
