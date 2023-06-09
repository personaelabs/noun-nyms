import Spinner from '@/components/global/Spinner';
import useError from '@/hooks/useError';
import { UserContextType } from '@/types/components';
import { useContext, useEffect, useMemo, useState } from 'react';
import { NotificationsContext, UserContext } from './_app';
import { SingleNotification } from '@/components/notifications/SingleNotification';
import { useAccount } from 'wagmi';
import { Filters } from '@/components/post/Filters';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { RefreshNotifications } from '@/components/notifications/RefreshNotifications';
import { WalletWarning } from '@/components/WalletWarning';
import { NotificationsContextType } from '@/types/notifications';
import { useIsMounted } from '@/hooks/useIsMounted';
import { RetryError } from '@/components/global/RetryError';

export default function Notifications() {
  const { address } = useAccount();
  const isMounted = useIsMounted();
  const { isValid, pushRoute, nymOptions } = useContext(UserContext) as UserContextType;
  const { notifications, unread, isLoading, setNotificationsAsRead, fetchNotifications, errorMsg } =
    useContext(NotificationsContext) as NotificationsContextType;

  const [filter, setFilter] = useState('all');
  const [showWalletWarning, setShowWalletWarning] = useState(!address || !isValid);

  const notificationsToShow = useMemo(
    () => (filter === 'unread' ? unread : notifications),
    [filter, notifications, unread],
  );

  useEffect(() => {
    if (!address || !isValid) setShowWalletWarning(true);
    else setShowWalletWarning(false);
  }, [address, isValid]);

  const filters = {
    all: 'All',
    unread: 'Unread',
  };

  return (
    <main>
      <div className="w-full bg-gray-50 flex flex-col justify-center items-center">
        <div className="bg-gray-50 min-h-screen w-full">
          <div className="flex flex-col gap-8 max-w-3xl mx-auto py-5 md:py-10 px-3 md:px-0">
            <div className="flex justify-between items-center">
              <h3>Notifications</h3>
              <RefreshNotifications nymOptions={nymOptions} />
            </div>
            {isLoading ? (
              <Spinner />
            ) : errorMsg ? (
              <RetryError
                message={'Could not fetch notifications: '}
                error={errorMsg}
                refetchHandler={() =>
                  fetchNotifications({ address: address as string, nymOptions })
                }
              />
            ) : notificationsToShow ? (
              <>
                <div className="flex justify-between items-center">
                  <Filters
                    filters={filters}
                    selectedFilter={filter}
                    setSelectedFilter={setFilter}
                  />
                  <div
                    className="flex gap-1 justify-end items-center cursor-pointer"
                    onClick={() => setNotificationsAsRead({ address, markAll: true })}
                  >
                    <FontAwesomeIcon icon={faCheck} size={'xs'} />
                    <p className="secondary hover:underline">Mark all as read</p>
                  </div>
                </div>
                {notificationsToShow.length > 0 ? (
                  notificationsToShow.map((n, i) => (
                    <div
                      className="flex gap-4 justify-between items-center outline-none rounded-2xl transition-all shadow-sm bg-white p-3 border border-gray-200 hover:border-gray-500 hover:cursor-pointer w-full"
                      key={i}
                      onClick={() => {
                        setNotificationsAsRead({ address, id: n.id });
                        pushRoute(`/posts/${n.postId}`);
                      }}
                    >
                      <SingleNotification n={n} setAsRead={setNotificationsAsRead} />
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-center">No notifications</p>
                )}
              </>
            ) : (
              <p className="p-4 text-center">No notifications</p>
            )}
            {isMounted && showWalletWarning && (
              <WalletWarning
                handleClose={() => setShowWalletWarning(false)}
                action={'get notifications'}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
