import { UserAvatar } from './global/UserAvatar';
import { useContext, useRef, useState } from 'react';
import { NameType, UserContextType } from '@/types/components';
import useName from '@/hooks/useName';
import { UserContext } from '@/pages/_app';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import ConnectWallet from './ConnectWallet';
import { Menu } from '@headlessui/react';
import { getUserIdFromName } from '@/lib/client-utils';
import { header as TEXT } from '@/lib/text';
import { TransitionFade } from './global/TransitionFade';
import MenuItem from './userInput/MenuItem';
import { NewNymMenuItem } from './userInput/NewNymMenuItem';
import { NewNymModal } from './userInput/NewNymModal';

export const MyProfile = ({ address }: { address: string }) => {
  const { isMobile, nymOptions, isValid, pushRoute, setNymOptions } = useContext(
    UserContext,
  ) as UserContextType;
  const { name } = useName({ userId: address });

  const menuItemRef = useRef<HTMLButtonElement>(null);
  const [openNewNym, setOpenNewNym] = useState(false);

  return (
    <>
      {address && isValid && (
        <>
          <NewNymModal
            address={address}
            isOpen={openNewNym}
            handleClose={() => setOpenNewNym(false)}
            nymOptions={nymOptions}
            setNymOptions={setNymOptions}
          />
          <Menu as={'div'} className="relative cursor-pointer z-50">
            {({ open }) => (
              <>
                <Menu.Button className="flex items-center gap-2 rounded-xl px-2 py-1 border border-white hover:scale-105 active:scale-100 transition-all">
                  <UserAvatar width={30} userId={address} />
                  <FontAwesomeIcon icon={faAngleDown} className="text-white" />
                </Menu.Button>
                <TransitionFade show={open}>
                  <Menu.Items className="max-w-[180px] absolute top-full right-0 bg-white mt-2 border border-gray-200 rounded-xl cursor-pointer">
                    {isMobile && address && isValid && (
                      <>
                        <p className="secondary p-2">{TEXT.wallet}</p>
                        <Menu.Item disabled as={'div'} className="w-full flex justify-center">
                          <ConnectWallet />
                        </Menu.Item>
                      </>
                    )}
                    <p className="secondary p-2">{TEXT.myIdentities}</p>
                    <Menu.Item>
                      {({ active }) => (
                        <MenuItem
                          ref={menuItemRef}
                          active={active}
                          handler={() => pushRoute(`/users/${address}`)}
                        >
                          <>
                            <UserAvatar type={NameType.DOXED} userId={address} width={20} />
                            <p className="grow text-left breakText">{name}</p>
                          </>
                        </MenuItem>
                      )}
                    </Menu.Item>
                    {nymOptions &&
                      nymOptions.map((nym) => (
                        <Menu.Item key={nym.nymSig}>
                          {({ active }) => (
                            <MenuItem
                              ref={menuItemRef}
                              active={active}
                              handler={() => pushRoute(`/users/${getUserIdFromName(nym)}`)}
                            >
                              <>
                                <UserAvatar
                                  type={NameType.PSEUDO}
                                  userId={getUserIdFromName(nym)}
                                  width={20}
                                />
                                <p className="grow text-left breakText">{nym.name}</p>
                              </>
                            </MenuItem>
                          )}
                        </Menu.Item>
                      ))}
                    <Menu.Item>
                      {({ active }) => (
                        <MenuItem
                          ref={menuItemRef}
                          active={active}
                          handler={() => setOpenNewNym(true)}
                        >
                          <NewNymMenuItem />
                        </MenuItem>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </TransitionFade>
              </>
            )}
          </Menu>
        </>
      )}
    </>
  );
};
