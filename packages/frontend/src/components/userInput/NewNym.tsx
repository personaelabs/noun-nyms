import Image from 'next/image';
import { Modal } from '../global/Modal';
import { useState } from 'react';
import { MainButton } from '../MainButton';
import { NYM_CODE_TYPE, DOMAIN } from '@personaelabs/nymjs';
import { useSignTypedData, useAccount } from 'wagmi';
import { ClientNym } from '@/types/components';

interface NewNymProps {
  handleClose: () => void;
  nymOptions: ClientNym[];
  setNymOptions: (nymOptions: ClientNym[]) => void;
}

const signNym = async (nymName: string, signTypedDataAsync: any): Promise<string> => {
  const nymSig = await signTypedDataAsync({
    primaryType: 'Nym',
    domain: DOMAIN,
    types: NYM_CODE_TYPE,
    message: {
      nymName,
    },
  });
  return nymSig as string;
};

export const NewNym = (props: NewNymProps) => {
  const { address } = useAccount();
  const { handleClose, nymOptions, setNymOptions } = props;
  const [nymName, setnymName] = useState('');

  const { signTypedDataAsync } = useSignTypedData();

  const storeNym = (nymSig: string) => {
    if (address) {
      const nyms = localStorage.getItem(address);
      let newVal: string;
      if (nyms) {
        let existingNyms = JSON.parse(nyms);
        existingNyms.push({ nymSig, nymName });
        newVal = JSON.stringify(existingNyms);
      } else {
        newVal = JSON.stringify([{ nymSig, nymName }]);
      }
      localStorage.setItem(address, newVal);
    }
  };

  const handleNewNym = async () => {
    try {
      const nymSig = await signNym(nymName, signTypedDataAsync);
      if (nymSig) storeNym(nymSig);

      setNymOptions([...nymOptions, { nymName, nymSig }]);
      handleClose();
    } catch (error) {
      //TODO: error handling
      console.error(error);
    }
  };
  return (
    <Modal width="50%" handleClose={handleClose}>
      <div className="flex flex-col gap-4 py-8 px-12 md:px-12 md:py-10">
        <div className="flex justify-start">
          <h3>Create a new nym</h3>
        </div>
        <p className="text-gray-700">
          What does it mean to create a new nym? Any warnings the user should know beforehand?
        </p>
        <div className="flex justify-start items-center gap-2">
          <Image alt={'profile'} src={'/anon-noun.png'} width={24} height={24} />
          <div className="relative border border-gray-200 rounded-md px-2 py-1">
            <input
              className="outline-none bg-transparent"
              type="text"
              placeholder="Name"
              value={nymName}
              onChange={(event) => setnymName(event.target.value)}
            />
          </div>
          <p className="secondary">#0000</p>
        </div>
        <div className="flex justify-center">
          <MainButton
            color="#0E76FD"
            message="Confirm"
            loading={false}
            handler={handleNewNym}
            disabled={nymName === ''}
          />
        </div>
      </div>
    </Modal>
  );
};
