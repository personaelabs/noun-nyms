import { useAccount, useDisconnect } from 'wagmi';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface TempGroup {
  members: {
    address: string;
  }[];
}

const useAccountLocal = () => {
  const { address } = useAccount();
  const [valid, setValid] = useState(true);
  const [error, setError] = useState('');
  const { disconnect } = useDisconnect();

  useEffect(() => {
    async function startFetching() {
      const res = await axios.get('/api/v1/groups/latest?set=1');
      if (address && res && res.status == 200) {
        const data = res.data as TempGroup;
        console.log(data);
        const exists = data.members.find((m) => m.address.toLowerCase() === address.toLowerCase());
        if (!exists) {
          setValid(false);
          console.log(`Member not in group, disconnecting...`);
          setError(`Member not in group, disconnecting...`);
          disconnect();
        } else {
          setError('');
          setValid(true);
        }
      }
    }
    startFetching();
  }, [address, disconnect]);

  return { address, valid, error };
};

export default useAccountLocal;
