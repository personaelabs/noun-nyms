import { ClientName, LocalNym, NameType } from '@/types/components';
import { PrefixedHex } from '@personaelabs/nymjs';
import { useState } from 'react';

const useUserInfo = ({ address }: { address?: PrefixedHex }) => {
  const getNymOptions = (address: string | undefined): ClientName[] => {
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

  const [nymOptions, setNymOptions] = useState<ClientName[]>(getNymOptions(address));
  const isValidUser = true;

  return { nymOptions, setNymOptions, isValidUser };
};

export default useUserInfo;
