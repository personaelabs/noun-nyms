import Spinner from '@/components/global/Spinner';
import { UserContextType } from '@/types/components';
import { useContext, useEffect, useState } from 'react';
import { NotificationsContext, UserContext } from './_app';
import { SingleNotification } from '@/components/notifications/SingleNotification';
import { useAccount } from 'wagmi';
import { RefreshNotifications } from '@/components/notifications/RefreshNotifications';
import { WalletWarning } from '@/components/WalletWarning';
import { Notification, NotificationsContextType } from '@/types/notifications';
import { useIsMounted } from '@/hooks/useIsMounted';
import { RetryError } from '@/components/global/RetryError';
import { NotificationsTools } from '@/components/notifications/NotificationsTools';

export default function Notifications() {
  const { address } = useAccount();
  const isMounted = useIsMounted();
  const { isValid, nymOptions } = useContext(UserContext) as UserContextType;
  const { notifications, isLoading, setAsRead, fetchNotifications, errorMsg } = useContext(
    NotificationsContext,
  ) as NotificationsContextType;
  const [notificationsToShow, setNotificationsToShow] = useState<Notification[]>(notifications);
  const [showWalletWarning, setShowWalletWarning] = useState(!address || !isValid);

  useEffect(() => setNotificationsToShow(notifications), [notifications]);

  useEffect(() => {
    if (!address || !isValid) setShowWalletWarning(true);
    else setShowWalletWarning(false);
  }, [address, isValid]);

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
                <NotificationsTools setFiltered={(n) => setNotificationsToShow(n)} />
                {notificationsToShow.length > 0 ? (
                  notificationsToShow.map((n, i) => (
                    <div
                      className="outline-none rounded-xl transition-all shadow-sm bg-white p-3 border border-gray-200 hover:border-gray-500 hover:cursor-pointer w-full"
                      key={i}
                    >
                      <SingleNotification n={n} setAsRead={setAsRead} />
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
