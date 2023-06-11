import { faBell, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Menu } from '@headlessui/react';
import Spinner from '../global/Spinner';
import { useAccount } from 'wagmi';
import { useContext, useEffect, useState } from 'react';
import { NotificationsContext, UserContext } from '@/pages/_app';
import { SingleNotification } from './SingleNotification';
import { RefreshNotifications } from './RefreshNotifications';
import { UserContextType } from '@/types/components';
import { Notification, NotificationsContextType } from '@/types/notifications';
import { RetryError } from '../global/RetryError';
import { NotificationsTools } from './NotificationsTools';

export const Notifications = () => {
  const { address } = useAccount();
  const { isMobile, nymOptions, pushRoute } = useContext(UserContext) as UserContextType;
  const { notifications, unread, isLoading, setAsRead, fetchNotifications, errorMsg } = useContext(
    NotificationsContext,
  ) as NotificationsContextType;
  const [notsToShow, setNotsToShow] = useState<Notification[]>(notifications);

  useEffect(() => setNotsToShow(notifications), [notifications]);

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
                    <div className="flex gap-3 items-center">
                      <RefreshNotifications nymOptions={nymOptions} />
                      <FontAwesomeIcon icon={faXmark} size={'lg'} color="#98A2B3" onClick={close} />
                    </div>
                  </div>
                  <NotificationsTools setFiltered={(n) => setNotsToShow(n)} />
                </div>
                {notsToShow && notsToShow.length > 0 ? (
                  <>
                    {notsToShow.slice(0, 5).map((n, i) => {
                      return (
                        <Menu.Item
                          as={'div'}
                          key={i}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-white hover:border-gray-500"
                        >
                          <SingleNotification n={n} setAsRead={setAsRead} trim={true} />
                        </Menu.Item>
                      );
                    })}
                    <Menu.Item
                      as={'div'}
                      className="py-2 hover:underline hover:bg-gray-200 rounded-b-xl"
                      onClick={() => pushRoute('/notifications')}
                    >
                      <p className="text-center">See All Notifications</p>
                    </Menu.Item>
                  </>
                ) : isLoading ? (
                  <div className="p-4">
                    <Spinner />
                  </div>
                ) : errorMsg ? (
                  <RetryError
                    message={'Could not fetch notifications: '}
                    error={errorMsg}
                    refetchHandler={() =>
                      fetchNotifications({ address: address as string, nymOptions })
                    }
                  />
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
