import { faAngleDown, faAngleUp, faCheck, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { NewNym } from './NewNym';
import { ClientNym } from '@/types/components';
import { useAccount } from 'wagmi';

interface NymSelectProps {
  selectedNym: ClientNym;
  setSelectedNym: (selectedNym: ClientNym) => void;
}

const getNymOptions = (address: string | undefined) => {
  const nymOptionsString = address ? localStorage.getItem(address) : '';
  return nymOptionsString ? (JSON.parse(nymOptionsString) as ClientNym[]) : [];
};

export const NymSelect = (props: NymSelectProps) => {
  const { address } = useAccount();
  const { selectedNym, setSelectedNym } = props;
  const divRef = useRef<HTMLDivElement>(null);

  const [openSelect, setOpenSelect] = useState<boolean>(false);
  const [openNewNym, setOpenNewNym] = useState<boolean>(false);
  const [nymOptions, setNymOptions] = useState<ClientNym[]>(getNymOptions(address));

  //TODO: make this outclick event work for nym select modal
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (divRef.current && !divRef.current.contains(event.target as Node)) {
        setOpenSelect(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  return (
    <>
      {openNewNym ? (
        <NewNym
          handleClose={() => setOpenNewNym(false)}
          nymOptions={nymOptions}
          setNymOptions={setNymOptions}
        />
      ) : null}
      <p className="secondary">Posting as</p>
      <div className="relative w-max" ref={divRef}>
        <div
          className="bg-white flex gap-2 border items-center border-gray-200 rounded-xl px-2 py-2.5 cursor-pointer"
          onClick={() => setOpenSelect(!openSelect)}
        >
          <Image alt={'profile'} src={'/anon-noun.png'} width={20} height={20} />
          <p>{selectedNym.nymName}</p>
          <FontAwesomeIcon icon={openSelect ? faAngleUp : faAngleDown} />
        </div>
        {openSelect ? (
          <div className="w-max absolute top-full left-0 w-full bg-white mt-2 border items-center border-gray-200 rounded-xl cursor-pointer">
            {nymOptions &&
              nymOptions.map((nym) => (
                <div
                  key={nym.nymSig}
                  className="flex justify-between gap-2 items-center px-2 py-2.5 rounded-xl hover:bg-gray-100"
                  onClick={() => {
                    setSelectedNym(nym);
                    setOpenSelect(false);
                  }}
                >
                  <div className="flex gap-2 justify-start">
                    <Image alt={'profile'} src={'/anon-noun.png'} width={20} height={20} />
                    <p>{nym.nymName}</p>
                  </div>
                  <FontAwesomeIcon
                    icon={faCheck}
                    color={'#0E76FD'}
                    className={`${nym.nymSig === selectedNym.nymSig ? 'opacity-1' : 'opacity-0'}`}
                  />
                </div>
              ))}
            <div
              className="items-center flex gap-2 px-2 py-2.5 rounded-xl hover:bg-gray-100"
              onClick={() => setOpenNewNym(true)}
            >
              <FontAwesomeIcon icon={faPlus} className="w-5" color={'#0E76FD'} />
              <p>New Nym</p>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};
