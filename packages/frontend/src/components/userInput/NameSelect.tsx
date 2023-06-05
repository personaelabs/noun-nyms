import { faAngleDown, faAngleUp, faCheck, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useContext, useEffect, useRef, useState } from 'react';
import { NewNym } from './NewNym';
import { ClientName, NameType, UserContextType } from '@/types/components';
import { UserAvatar } from '../global/UserAvatar';
import useName from '@/hooks/useName';
import { useAccount } from 'wagmi';
import { UserContext } from '@/pages/_app';
import { getUserIdFromName } from '@/lib/example-utils';

interface NameSelectProps {
  selectedName: ClientName | null;
  setSelectedName: (selectedName: ClientName | null) => void;
}

export const NameSelect = (props: NameSelectProps) => {
  const { selectedName, setSelectedName } = props;
  const divRef = useRef<HTMLDivElement>(null);
  const { address } = useAccount();

  const { nymOptions, setNymOptions } = useContext(UserContext) as UserContextType;
  const doxedName = { type: NameType.DOXED, name: useName({ userId: address }).name };

  const [openSelect, setOpenSelect] = useState<boolean>(false);
  const [openNewNym, setOpenNewNym] = useState<boolean>(false);
  const [maxSelectHeight, setMaxSelectHeight] = useState<number>(0);

  //TODO: make this outclick event work for nym select modal
  useEffect(() => {
    setSelectedName(nymOptions.length > 0 ? nymOptions[nymOptions.length - 1] : null);
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
  }, [nymOptions, setSelectedName]);

  return (
    <>
      {address && openNewNym ? (
        <NewNym
          address={address}
          handleClose={() => {
            setOpenNewNym(false), setOpenSelect(false);
          }}
          nymOptions={nymOptions}
          setNymOptions={setNymOptions}
          setSelectedName={setSelectedName}
        />
      ) : null}
      <p className="secondary shrink-0">Posting as</p>
      <div className="relative w-auto md:w-[30%]" ref={divRef}>
        <div
          className="bg-white flex gap-2 justify-between border items-center border-gray-200 rounded-xl px-2 py-2.5 cursor-pointer"
          onClick={() => setOpenSelect(!openSelect)}
        >
          <div className="flex gap-2" style={{ width: 'calc(100% - 18px)' }}>
            {selectedName && (
              <UserAvatar
                type={selectedName.type}
                userId={getUserIdFromName(selectedName)}
                width={20}
              />
            )}
            <p className="breakText">{selectedName ? selectedName.name : 'No Nym Selected'}</p>
          </div>
          <FontAwesomeIcon icon={openSelect ? faAngleUp : faAngleDown} />
        </div>
        {openSelect ? (
          <div
            className="w-full absolute top-full left-0 bg-white mt-2 border border-gray-200 rounded-xl cursor-pointer"
            style={{ maxHeight: maxSelectHeight, overflow: 'scroll' }}
          >
            <div
              className="items-center flex gap-2 px-2 py-2.5 rounded-xl hover:bg-gray-100"
              onClick={() => setOpenNewNym(true)}
            >
              <FontAwesomeIcon icon={faPlus} className="w-5" color={'#0E76FD'} />
              <p>New Nym</p>
            </div>
            <div className="border-b border-dotted border-gray-300">
              {nymOptions &&
                nymOptions.map((nym) => (
                  <div
                    key={nym.nymSig}
                    className="w-full flex justify-between gap-2 px-2 py-2.5 rounded-xl hover:bg-gray-100"
                    onClick={() => {
                      setSelectedName(nym);
                      setOpenSelect(false);
                    }}
                  >
                    <div className="w-full flex justify-between items-center gap-2">
                      <div className="flex gap-2" style={{ width: 'calc(100% - 18px)' }}>
                        <UserAvatar
                          type={NameType.PSEUDO}
                          userId={getUserIdFromName(nym)}
                          width={20}
                        />
                        <p className="shrink breakText">{nym.name}</p>
                      </div>
                      <FontAwesomeIcon
                        icon={faCheck}
                        color={'#0E76FD'}
                        className={`shrink-0 ${
                          selectedName && nym.nymSig === selectedName.nymSig
                            ? 'opacity-1'
                            : 'opacity-0'
                        }`}
                      />
                    </div>
                  </div>
                ))}
            </div>
            <div
              className="w-full flex justify-between gap-2 items-center px-2 py-2.5 rounded-xl hover:bg-gray-100"
              onClick={() => {
                setSelectedName(doxedName);
                setOpenSelect(false);
              }}
            >
              <div className="flex gap-2" style={{ width: 'calc(100% - 18px)' }}>
                <UserAvatar
                  type={NameType.DOXED}
                  userId={getUserIdFromName(doxedName)}
                  width={20}
                />
                <p className="shrink breakText">{doxedName.name}</p>
              </div>
              <FontAwesomeIcon
                icon={faCheck}
                color={'#0E76FD'}
                className={`shrink-0 ${
                  selectedName?.name === doxedName.name ? 'opacity-1' : 'opacity-0'
                }`}
              />
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};
