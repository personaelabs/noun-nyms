import useNotifications from '@/hooks/useNotifications';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import Spinner from '../global/Spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { ClientName } from '@/types/components';

export const RefreshNotifications = (props: { nymOptions: ClientName[] }) => {
  const { nymOptions } = props;
  const { address } = useAccount();
  const { fetchNotifications } = useNotifications({ enabled: true });
  const [refetching, setRefetching] = useState(false);

  const refetch = async () => {
    setRefetching(true);
    await fetchNotifications(address as string, nymOptions);
    setRefetching(false);
  };
  return (
    <div className="cursor-pointer">
      {refetching ? (
        <Spinner />
      ) : (
        <FontAwesomeIcon icon={faRefresh} size={'lg'} color={'#98A2B3'} onClick={refetch} />
      )}
    </div>
  );
};
