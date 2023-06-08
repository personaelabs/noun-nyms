import { useNotifications } from '@/hooks/useNotifications';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import Spinner from '../global/Spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { ClientName } from '@/types/components';
import { fromNowDate } from '@/lib/example-utils';

export const RefreshNotifications = (props: { nymOptions: ClientName[] }) => {
  const { nymOptions } = props;
  const { address } = useAccount();
  const { fetchNotifications } = useNotifications();
  const [refetching, setRefetching] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(fromNowDate(new Date()));

  const refetch = async () => {
    if (address) {
      setRefetching(true);
      await fetchNotifications(address, nymOptions);
      setLastRefresh(fromNowDate(new Date()));
      setRefetching(false);
    }
  };
  return (
    <div className="flex gap-4 items-center">
      <p className="secondary">Last Refresh: {lastRefresh}</p>
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
