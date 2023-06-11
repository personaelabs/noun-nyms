import { UserAvatar } from './global/UserAvatar';
import { useContext, useEffect, useState } from 'react';
import { NameType, UserContextType } from '@/types/components';
import useName from '@/hooks/useName';
import { UserContext } from '@/pages/_app';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faUser } from '@fortawesome/free-solid-svg-icons';
import ConnectWallet from './ConnectWallet';
import { Menu } from '@headlessui/react';
import { getUserIdFromName } from '@/lib/example-utils';

export const MyProfile = ({ address }: { address: string }) => {
  const { isMobile, nymOptions, isValid, pushRoute } = useContext(UserContext) as UserContextType;
  const { name } = useName({ userId: address });

  return (
    <>
      {address && isValid ? (
        <Menu as={'div'} className="relative cursor-pointer">
          <Menu.Button className="flex items-center gap-2 rounded-xl px-2 py-1 border border-white hover:scale-105 active:scale-100 transition-all">
            <UserAvatar width={30} userId={address} />
            <FontAwesomeIcon icon={faAngleDown} color="#ffffff" />
          </Menu.Button>
          <Menu.Items className="max-w-[150px] absolute top-full right-0 bg-white mt-2 border border-gray-200 rounded-xl cursor-pointer">
            {isMobile && address && isValid && (
              <>
                <p className="secondary p-2">Wallet</p>
                <Menu.Item disabled as={'div'} className="w-full flex justify-center">
                  <ConnectWallet />
                </Menu.Item>
              </>
            )}
            <p className="secondary p-2">My identities</p>
            <div className="border-b border-dotted border-gray-300">
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
                    <UserAvatar type={NameType.PSEUDO} userId={getUserIdFromName(nym)} width={20} />
                    <p className="breakText">{nym.name}</p>
                  </Menu.Item>
                ))}
            </div>
            <Menu.Item
              as={'div'}
              className="min-w-0 shrink w-full flex items-center gap-2 px-2 py-2.5 rounded-xl hover:bg-gray-100"
              onClick={() => pushRoute('/users')}
            >
              <FontAwesomeIcon className="w-6" icon={faUser} />
              <p>All Users</p>
            </Menu.Item>
          </Menu.Items>
        </Menu>
      ) : (
        <div
          className="flex items-center gap-2 rounded-xl px-2 py-1 h-10 border border-white hover:scale-105 active:scale-100 transition-all"
          onClick={() => pushRoute('/users')}
        >
          <div className="flex gap-2 items-center">
            <FontAwesomeIcon icon={faUser} color={'#ffffff'} />
            <p className="text-white font-semibold">All Users</p>
          </div>
        </div>
      )}
    </>
  );
};
