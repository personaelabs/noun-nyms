import { faAngleDown, faAngleUp, faCheck, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useRef, useState } from 'react';
import { NewNym } from './NewNym';
import { ClientNym } from '@/types/components';
import { UserAvatar } from '../global/UserAvatar';

interface NymSelectProps {
  address: string;
  selectedNym: ClientNym;
  setSelectedNym: (selectedNym: ClientNym) => void;
}

const getNymOptions = (address: string, doxed: ClientNym) => {
  const nymOptionsString = localStorage.getItem(address);
  return [doxed].concat(nymOptionsString ? (JSON.parse(nymOptionsString) as ClientNym[]) : []);
};

export const NymSelect = (props: NymSelectProps) => {
  const { address, selectedNym, setSelectedNym } = props;
  const divRef = useRef<HTMLDivElement>(null);
  const doxed = { nymSig: '0x0', nymHash: '', nymName: address };

  const [openSelect, setOpenSelect] = useState<boolean>(false);
  const [openNewNym, setOpenNewNym] = useState<boolean>(false);
  const [nymOptions, setNymOptions] = useState<ClientNym[]>(getNymOptions(address, doxed));
  const [maxSelectHeight, setMaxSelectHeight] = useState<number>(0);

  const getUserId = (nym: ClientNym): string => {
    return nym.nymName === address ? address : `${nym.nymName}-${nym.nymHash}`;
  };

  //TODO: make this outclick event work for nym select modal
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (divRef.current && !divRef.current.contains(event.target as Node)) {
        setOpenSelect(false);
      }
    };

    if (divRef.current) {
      const { bottom } = divRef.current.getBoundingClientRect();
      setMaxSelectHeight(window.innerHeight - bottom - 30);
      document.addEventListener('click', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  return (
    <>
      {openNewNym ? (
        <NewNym
          address={address}
          handleClose={() => {
            setOpenNewNym(false), setOpenSelect(false);
          }}
          nymOptions={nymOptions}
          setNymOptions={setNymOptions}
          setSelectedNym={setSelectedNym}
        />
      ) : null}
      <p className="secondary">Posting as</p>
      <div className="relative w-[30%]" ref={divRef}>
        <div
          className="bg-white flex gap-2 justify-between border items-center border-gray-200 rounded-xl px-2 py-2.5 cursor-pointer"
          onClick={() => setOpenSelect(!openSelect)}
        >
          <div className="flex gap-2" style={{ width: 'calc(100% - 18px)' }}>
            <UserAvatar userId={getUserId(selectedNym)} width={20} />
            <p className="overflow-hidden text-ellipsis whitespace-nowrap">{selectedNym.nymName}</p>
          </div>
          <FontAwesomeIcon icon={openSelect ? faAngleUp : faAngleDown} />
        </div>
        {openSelect ? (
          <div
            className="w-full absolute top-full left-0 bg-white mt-2 border border-gray-200 rounded-xl cursor-pointer"
            style={{ maxHeight: maxSelectHeight, overflow: 'scroll' }}
          >
            {nymOptions &&
              nymOptions.map((nym) => (
                <div
                  key={nym.nymSig}
                  className="w-full flex justify-between gap-2 items-center px-2 py-2.5 rounded-xl hover:bg-gray-100"
                  onClick={() => {
                    console.log(`setting as seleced`, nym);
                    setSelectedNym(nym);
                    setOpenSelect(false);
                  }}
                >
                  <div className="w-full flex justify-between gap-2">
                    <div className="flex gap-2" style={{ width: 'calc(100% - 18px)' }}>
                      <UserAvatar userId={getUserId(nym)} width={20} />
                      <p className="shrink overflow-hidden text-ellipsis whitespace-nowrap">
                        {nym.nymName}
                      </p>
                    </div>
                    <FontAwesomeIcon
                      icon={faCheck}
                      color={'#0E76FD'}
                      className={`shrink-0 ${
                        nym.nymSig === selectedNym.nymSig ? 'opacity-1' : 'opacity-0'
                      }`}
                    />
                  </div>
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
