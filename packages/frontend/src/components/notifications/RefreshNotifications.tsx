import { useContext, useState } from 'react';
import { useAccount } from 'wagmi';
import Spinner from '../global/Spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { ClientName } from '@/types/components';
import { NotificationsContext } from '@/pages/_app';
import { NotificationsContextType } from '@/types/notifications';
import { notifications as TEXT } from '@/lib/text';

export const RefreshNotifications = (props: { nymOptions: ClientName[] }) => {
  const { nymOptions } = props;
  const { address } = useAccount();
  const { fetchNotifications, lastRefresh } = useContext(
    NotificationsContext,
  ) as NotificationsContextType;
  const [refetching, setRefetching] = useState(false);

  const refetch = async () => {
    if (address) {
      setRefetching(true);
      await fetchNotifications({ address, nymOptions });
      setRefetching(false);
    }
  };
  return (
    <div className="flex gap-4 items-center">
      {lastRefresh && (
        <p className="secondary">
          {TEXT.lastUpdated} {lastRefresh}
        </p>
      )}
      <div className="cursor-pointer">
        <div className="flex items-center w-5 h-4">
          {refetching ? (
            <Spinner />
          ) : (
            <FontAwesomeIcon icon={faRefresh} size={'lg'} color={'#98A2B3'} onClick={refetch} />
          )}
        </div>
      </div>
    </div>
  );
};
