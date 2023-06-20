import { UserAvatar } from './global/UserAvatar';
import { Fragment, useContext } from 'react';
import { NameType, UserContextType } from '@/types/components';
import useName from '@/hooks/useName';
import { UserContext } from '@/pages/_app';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import ConnectWallet from './ConnectWallet';
import { Menu, Transition } from '@headlessui/react';
import { getUserIdFromName } from '@/lib/client-utils';
import { header as TEXT } from '@/lib/text';

export const MyProfile = ({ address }: { address: string }) => {
  const { isMobile, nymOptions, isValid, pushRoute } = useContext(UserContext) as UserContextType;
  const { name } = useName({ userId: address });

  return (
    <>
      {address && isValid ? (
        <Menu as={'div'} className="relative cursor-pointer z-50">
          {({ open }) => (
            <>
              <Menu.Button className="flex items-center gap-2 rounded-xl px-2 py-1 border border-white hover:scale-105 active:scale-100 transition-all">
                <UserAvatar width={30} userId={address} />
                <FontAwesomeIcon icon={faAngleDown} color="#ffffff" />
              </Menu.Button>
              <Transition
                show={open}
                appear={true}
                enter="transition-opacity duration-5000"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-5000"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                as={Fragment}
              >
                <Menu.Items className="max-w-[150px] absolute top-full right-0 bg-white mt-2 border border-gray-200 rounded-xl cursor-pointer">
                  {isMobile && address && isValid && (
                    <>
                      <p className="secondary p-2">{TEXT.wallet}</p>
                      <Menu.Item disabled as={'div'} className="w-full flex justify-center">
                        <ConnectWallet />
                      </Menu.Item>
                    </>
                  )}
                  <p className="secondary p-2">{TEXT.myIdentities}</p>
                  <Menu.Item
                    as={'div'}
                    className="min-w-0 shrink w-full flex items-center gap-2 px-2 py-2.5 rounded-xl hover:bg-gray-100"
                    onClick={() => pushRoute(`/users/${address}`)}
                  >
                    <UserAvatar type={NameType.DOXED} userId={address} width={20} />
                    <p className="breakText">{name}</p>
                  </Menu.Item>
                  {nymOptions &&
                    nymOptions.map((nym) => (
                      <Menu.Item
                        as={'div'}
                        key={nym.nymSig}
                        className="min-w-0 shrink w-full flex items-center gap-2 px-2 py-2.5 rounded-xl hover:bg-gray-100"
                        onClick={() => pushRoute(`/users/${getUserIdFromName(nym)}`)}
                      >
                        <UserAvatar
                          type={NameType.PSEUDO}
                          userId={getUserIdFromName(nym)}
                          width={20}
                        />
                        <p className="breakText">{nym.name}</p>
                      </Menu.Item>
                    ))}
                </Menu.Items>
              </Transition>
            </>
          )}
        </Menu>
      ) : null}
    </>
  );
};
