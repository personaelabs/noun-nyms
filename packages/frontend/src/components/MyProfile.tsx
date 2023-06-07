import { UserAvatar } from './global/UserAvatar';
import { useContext, useEffect, useState } from 'react';
import { ClientName, NameType, UserContextType } from '@/types/components';
import useName from '@/hooks/useName';
import { UserContext } from '@/pages/_app';
import { useAccount } from 'wagmi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faUser } from '@fortawesome/free-solid-svg-icons';
import ConnectWallet from './ConnectWallet';
import { Menu } from '@headlessui/react';

export const MyProfile = () => {
  const { address } = useAccount();
  const { isMobile, nymOptions, isValid, pushRoute } = useContext(UserContext) as UserContextType;
  const { name } = useName({ userId: address });

  const [localAddress, setLocalAddress] = useState('');

  const getUserIdFromName = (user: ClientName): string => {
    if (user.name) {
      return user.type === NameType.PSEUDO ? `${user.name}-${user.nymHash}` : user.name;
    } else return '';
  };

  useEffect(() => {
    // Prevents server side mismatch with address. Idk why
    if (address) setLocalAddress(address);
  }, [address]);

  return (
    <>
      {localAddress && isValid ? (
        <Menu as={'div'} className="relative cursor-pointer">
          <Menu.Button className="flex items-center gap-2 rounded-xl px-2 py-1 border border-white hover:scale-105 active:scale-100 transition-all">
            <UserAvatar width={30} userId={localAddress} />
            <FontAwesomeIcon icon={faAngleDown} color="#ffffff" />
          </Menu.Button>
          <Menu.Items className="max-w-[150px] absolute top-full right-0 bg-white mt-2 border border-gray-200 rounded-xl cursor-pointer">
            {isMobile && localAddress && isValid && (
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
                onClick={() => pushRoute(`/users/${localAddress}`)}
              >
                <UserAvatar type={NameType.DOXED} userId={localAddress} width={20} />
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
