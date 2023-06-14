import { Modal } from '../global/Modal';
import { useMemo, useState } from 'react';
import { MainButton } from '../MainButton';
import { NYM_CODE_TYPE, DOMAIN, NYM_CODE_WARNING, computeNymHash } from '@personaelabs/nymjs';
import { useSignTypedData } from 'wagmi';
import { ClientName, LocalNym, NameType } from '@/types/components';
import { UserAvatar } from '../global/UserAvatar';
import useError from '@/hooks/useError';
import Confetti from 'react-confetti';
import { getUserIdFromName } from '@/lib/client-utils';
import text from '@/lib/text.json';

interface NewNymProps {
  address: string;
  handleClose: () => void;
  nymOptions: ClientName[];
  setNymOptions: (nymOptions: ClientName[]) => void;
  setSelectedName: (selectedNym: ClientName) => void;
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
  const { address, handleClose, nymOptions, setNymOptions, setSelectedName } = props;
  const TEXT = text.newNym;
  const [nymName, setNymName] = useState('');
  const [newNym, setNewNym] = useState<ClientName>();
  const [loadingNym, setLoadingNym] = useState(false);
  const { errorMsg, setError } = useError();
  const existingNames = useMemo(() => nymOptions.map((nym) => nym.name), [nymOptions]);
  const { signTypedDataAsync } = useSignTypedData();

  const storeNym = async (nymSig: string, nymHash: string) => {
    const nyms = localStorage.getItem(address);
    let newVal: string;
    if (nyms) {
      let existingNyms = JSON.parse(nyms) as LocalNym[];
      existingNyms.push({ nymName, nymSig, nymHash });
      newVal = JSON.stringify(existingNyms);
    } else {
      newVal = JSON.stringify([{ nymSig, nymName, nymHash }]);
    }
    localStorage.setItem(address, newVal);
  };

  const handleNewNym = async () => {
    try {
      setError('');
      setLoadingNym(true);
      if (!nymName) throw new Error(TEXT.inputError.noName);
      if (existingNames.includes(nymName)) throw new Error(TEXT.inputError.duplicate);
      const nymSig = await signNym(nymName, signTypedDataAsync);
      const nymHash = await computeNymHash(nymSig);
      if (nymSig) storeNym(nymSig, nymHash);
      const newNym = { type: NameType.PSEUDO, name: nymName, nymSig, nymHash };
      setNymOptions([...nymOptions, newNym]);
      setSelectedName(newNym);
      setNewNym(newNym);
      // handleClose();
      setLoadingNym(false);
    } catch (error) {
      setError(error);
      setLoadingNym(false);
    }
  };
  return (
    <Modal width="60%" handleClose={handleClose}>
      {newNym && (
        <Confetti
          recycle={false}
          numberOfPieces={502}
          width={Math.floor(window.innerWidth * 0.6)}
          onConfettiComplete={() => ''}
        />
      )}
      <div className="flex flex-col gap-4 py-8 px-12 md:px-12 md:py-10">
        <div className="flex justify-start">
          <h3>{newNym ? TEXT.afterTitle : TEXT.beforeTitle}</h3>
        </div>
        <p className="text-gray-700">{newNym ? TEXT.afterBody : TEXT.beforeBody}</p>
        {errorMsg && (
          <p className="error">
            {TEXT.fetchError} {errorMsg}
          </p>
        )}
        <div className="flex flex-wrap justify-start items-center gap-2">
          <div className="flex gap-2 items-center">
            <UserAvatar width={30} userId={newNym ? getUserIdFromName(newNym) : address} />
            <div className="min-w-0 shrink relative border border-gray-200 rounded-md px-2 py-1">
              {newNym ? (
                <p>{newNym.name}</p>
              ) : (
                <input
                  className="outline-none bg-transparent"
                  type="text"
                  placeholder="Name"
                  value={nymName}
                  onChange={(event) => {
                    if (errorMsg) setError('');
                    setNymName(event.target.value);
                  }}
                />
              )}
            </div>
          </div>
          {!newNym && (
            <button
              className="shrink-0 secondary underline"
              onClick={() => setNymName(generateRandomString(5))}
            >
              {TEXT.generateRandom}
            </button>
          )}
        </div>
        <div className="flex justify-center">
          {newNym ? (
            <MainButton
              color="#0E76FD"
              message={TEXT.afterButtonText}
              handler={handleClose}
              disabled={nymName === ''}
            />
          ) : (
            <MainButton
              color="#0E76FD"
              message={TEXT.beforeButtonText}
              loading={loadingNym}
              handler={handleNewNym}
              disabled={nymName === ''}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};
