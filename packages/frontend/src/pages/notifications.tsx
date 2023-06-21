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
import { notifications as TEXT } from '@/lib/text';

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
    <main className="flex justify-center w-full min-h-screen bg-gray-50">
      <div className="flex flex-col gap-4 w-full max-w-3xl px-6 md:px-0 py-3 md:py-6 mt-6">
        <div className="flex justify-between items-center">
          <h3>{TEXT.title}</h3>
          {address && isValid && <RefreshNotifications nymOptions={nymOptions} />}
        </div>
        {isLoading ? (
          <Spinner />
        ) : errorMsg ? (
          <RetryError
            message={TEXT.fetchError}
            error={errorMsg}
            refetchHandler={() => fetchNotifications({ address: address as string, nymOptions })}
          />
        ) : notificationsToShow ? (
          <>
            {notificationsToShow.length > 0 && (
              <NotificationsTools setFiltered={(n) => setNotificationsToShow(n)} />
            )}
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
              <p className="p-4 text-center">{TEXT.noNotifications}</p>
            )}
          </>
        ) : (
          <p className="p-4 text-center">{TEXT.noNotifications}</p>
        )}
        {isMounted && (
          <WalletWarning
            isOpen={showWalletWarning}
            handleClose={() => setShowWalletWarning(false)}
            action={TEXT.action}
          />
        )}
      </div>
    </main>
  );
}
