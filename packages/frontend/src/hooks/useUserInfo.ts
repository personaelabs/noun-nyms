import { ClientName, LocalNym, NameType } from '@/types/components';
import { PrefixedHex } from '@personaelabs/nymjs';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface TempGroup {
  members: {
    address: string;
  }[];
}

export const getNymOptions = (address: string | undefined): ClientName[] => {
  let nymOptions: ClientName[] = [];
  const nymOptionsString = address && localStorage.getItem(address);
  if (nymOptionsString) {
    JSON.parse(nymOptionsString).forEach((nym: LocalNym) => {
      nymOptions.push({
        type: NameType.PSEUDO,
        name: nym.nymName,
        nymSig: nym.nymSig,
        nymHash: nym.nymHash,
      });
    });
  }
  return nymOptions;
};

const isValidMember = async (address: string | undefined): Promise<boolean> => {
  const res = await axios.get('/api/v1/groups/latest?set=1');
  if (address && res && res.status == 200) {
    const data = res.data as TempGroup;
    const exists = data.members.find((m) => m.address.toLowerCase() === address.toLowerCase());
    return exists ? true : false;
  }
  return false;
};

const useUserInfo = ({ address }: { address?: PrefixedHex }) => {
  const [nymOptions, setNymOptions] = useState<ClientName[]>(getNymOptions(address));
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    async function determineValidUser() {
      const valid = address ? await isValidMember(address) : true;
      setIsValid(valid);
    }
    setNymOptions(getNymOptions(address));
    determineValidUser();
  }, [address]);

  return { nymOptions, setNymOptions, isValid };
};

export default useUserInfo;
