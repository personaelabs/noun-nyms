import { faAngleDown, faAngleUp, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useContext, useEffect, useRef, useState } from 'react';
import { NewNym } from './NewNym';
import { ClientName, NameType, UserContextType } from '@/types/components';
import { UserAvatar } from '../global/UserAvatar';
import useName from '@/hooks/useName';
import { useAccount } from 'wagmi';
import { UserContext } from '@/pages/_app';
import { Menu } from '@headlessui/react';
import { NameMenuItem } from './NameMenuItem';
import { getUserIdFromName } from '@/lib/client-utils';
import text from '@/lib/text.json';
import MenuItem from './MenuItem';

interface NameSelectProps {
  selectedName: ClientName | null;
  setSelectedName: (selectedName: ClientName | null) => void;
  openMenuAbove?: boolean;
}

export const NameSelect = (props: NameSelectProps) => {
  const { selectedName, setSelectedName, openMenuAbove } = props;
  const TEXT = text.nameSelect;
  const { address } = useAccount();
  const { isValid, nymOptions, setNymOptions } = useContext(UserContext) as UserContextType;
  const { name, isEns } = useName({ userId: address });
  const doxedName = {
    type: NameType.DOXED,
    name,
    userId: address,
    isEns,
  };
  const [openNewNym, setOpenNewNym] = useState(false);
  const menuItemRef = useRef<HTMLButtonElement>(null);
  const nameSelectRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (nameSelectRef.current && !openNewNym) nameSelectRef.current.focus();
  }, [nameSelectRef, openNewNym]);

  return (
    <>
      {address && isValid && openNewNym ? (
        <NewNym
          address={address}
          handleClose={() => setOpenNewNym(false)}
          nymOptions={nymOptions}
          setNymOptions={setNymOptions}
          setSelectedName={setSelectedName}
        />
      ) : null}
      <p className="secondary shrink-0">{TEXT.postingAs}</p>
      <Menu as={'div'} className="min-w-0 max-w-min shrink grow relative basis-1/4 sm:basis-auto">
        {({ open }) => (
          <>
            <Menu.Button
              ref={nameSelectRef}
              className="w-full bg-white flex gap-2 justify-between border items-center border-gray-200 rounded-xl px-2 py-2.5 cursor-pointer"
            >
              <div className="min-w-0 shrink flex gap-2 items-center">
                {selectedName && (
                  <UserAvatar
                    type={selectedName.type}
                    userId={getUserIdFromName(selectedName)}
                    width={20}
                  />
                )}
                <p className="breakText">{selectedName ? selectedName.name : 'No Nym Selected'}</p>
              </div>
              <FontAwesomeIcon icon={open ? faAngleUp : faAngleDown} />
            </Menu.Button>
            <Menu.Items
              className={`${
                openMenuAbove ? 'bottom-full mb-2' : 'top-full mt-2'
              } w-max max-w-[180px] absolute left-full -translate-x-full bg-white border border-gray-200 rounded-xl cursor-pointer z-50`}
            >
              <Menu.Item>
                {({ active }) => (
                  <MenuItem
                    ref={menuItemRef}
                    active={active}
                    onClickHandler={() => setOpenNewNym(true)}
                  >
                    <div className="flex gap-2 items-center">
                      <FontAwesomeIcon icon={faPlus} className="w-5" color={'#0E76FD'} />
                      <p>{TEXT.newNym}</p>
                    </div>
                  </MenuItem>
                )}
              </Menu.Item>
              <div className="border-b border-dotted border-gray-300">
                {nymOptions &&
                  nymOptions.map((nym) => (
                    <Menu.Item key={nym.nymSig}>
                      {({ active }) => (
                        <MenuItem
                          ref={menuItemRef}
                          active={active}
                          onClickHandler={() => setSelectedName(nym)}
                        >
                          <NameMenuItem
                            type={NameType.PSEUDO}
                            userId={getUserIdFromName(nym)}
                            name={nym.name}
                            selected={nym.nymSig === selectedName?.nymSig}
                          />
                        </MenuItem>
                      )}
                    </Menu.Item>
                  ))}
              </div>
              {address && (
                <Menu.Item>
                  {({ active }) => (
                    <MenuItem
                      ref={menuItemRef}
                      active={active}
                      onClickHandler={() => setSelectedName(doxedName)}
                    >
                      <NameMenuItem
                        type={NameType.DOXED}
                        userId={address}
                        name={doxedName.name}
                        selected={doxedName.name === selectedName?.name}
                      />
                    </MenuItem>
                  )}
                </Menu.Item>
              )}
            </Menu.Items>
          </>
        )}
      </Menu>
    </>
  );
};
