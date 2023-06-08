import Spinner from '@/components/global/Spinner';
import useError from '@/hooks/useError';
import { useNotifications } from '@/hooks/useNotifications';
import { UserContextType } from '@/types/components';
import { useContext, useMemo, useState } from 'react';
import { UserContext } from './_app';
import { SingleNotification } from '@/components/notifications/SingleNotification';
import { useAccount } from 'wagmi';
import { Filters } from '@/components/post/Filters';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { RefreshNotifications } from '@/components/notifications/RefreshNotifications';

export default function Notifications() {
  const { address } = useAccount();
  const { pushRoute, nymOptions } = useContext(UserContext) as UserContextType;
  const { errorMsg, setError } = useError();
  const { notifications, unread, setNotifications, setNotificationsAsRead, isLoading } =
    useNotifications({
      enabled: true,
    });

  const [filter, setFilter] = useState('all');

  console.log({ notifications }, 'from page component');

  const notificationsToShow = useMemo(
    () => (filter === 'unread' ? unread : notifications),
    [filter, notifications, unread],
  );

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
            ) : notificationsToShow ? (
              <>
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
                {notificationsToShow && notificationsToShow.length > 0 ? (
                  notificationsToShow.map((n, i) => (
                    <div
                      className="flex gap-4 justify-between outline-none rounded-2xl transition-all shadow-sm bg-white p-3 md:px-5 md:py-4 border border-gray-200 hover:border-gray-300 hover:cursor-pointer w-full"
                      key={i}
                      onClick={() => {
                        setNotificationsAsRead(address, n.id);
                        pushRoute(`/posts/${n.postId}`);
                      }}
                    >
                      <SingleNotification n={n} />
                    </div>
                  ))
                ) : isLoading ? (
                  <div className="p-4">
                    <Spinner />
                  </div>
                ) : (
                  <div className="m-auto">
                    <p>No notifications.</p>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
