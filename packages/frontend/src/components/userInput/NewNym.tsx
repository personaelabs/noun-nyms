import Image from 'next/image';
import { Modal } from '../global/Modal';
import { useState } from 'react';
import { MainButton } from '../MainButton';
import { NYM_CODE_TYPE, DOMAIN, NYM_CODE_WARNING } from '@personaelabs/nymjs';
import { useSignTypedData, useAccount } from 'wagmi';
import { ClientNym } from '@/types/components';

interface NewNymProps {
  handleClose: () => void;
  nymOptions: ClientNym[];
  setNymOptions: (nymOptions: ClientNym[]) => void;
  setSelectedNym: (selectedNym: ClientNym) => void;
}

const signNym = async (nymName: string, signTypedDataAsync: any): Promise<string> => {
  const nymSig = await signTypedDataAsync({
    primaryType: 'Nym',
    domain: DOMAIN,
    types: NYM_CODE_TYPE,
    message: {
      nymName,
      warning: NYM_CODE_WARNING,
    },
  });
  return nymSig as string;
};

const generateRandomString = (length: number) => {
  let string = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let i = 0;
  while (i < length) {
    string += chars.charAt(Math.floor(Math.random() * chars.length));
    i += 1;
  }
  return string;
};

export const NewNym = (props: NewNymProps) => {
  const { address } = useAccount();
  const { handleClose, nymOptions, setNymOptions, setSelectedNym } = props;
  const [nymName, setNymName] = useState('');

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
      const newNym = { nymName, nymSig };
      setNymOptions([...nymOptions, newNym]);
      setSelectedNym(newNym);
      handleClose();
    } catch (error) {
      //TODO: error handling
      console.error(error);
    }
  };
  return (
    <Modal width="60%" handleClose={handleClose}>
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
              onChange={(event) => setNymName(event.target.value)}
            />
          </div>
          <button
            className="secondary underline"
            onClick={() => setNymName(generateRandomString(5))}
          >
            Generate random name
          </button>
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
