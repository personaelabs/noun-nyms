import { UserAvatar } from './global/UserAvatar';
import { useContext, useEffect, useState } from 'react';
import { NameType, UserContextType } from '@/types/components';
import useName from '@/hooks/useName';
import { UserContext } from '@/pages/_app';
import { useAccount } from 'wagmi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faUser } from '@fortawesome/free-solid-svg-icons';
import ConnectWallet from './ConnectWallet';
import { getUserIdFromName } from '@/lib/example-utils';

export const MyProfile = () => {
  const { address } = useAccount();
  const { isMobile, nymOptions, isValid } = useContext(UserContext) as UserContextType;
  const { name } = useName({ userId: address });

  const [openProfile, setOpenProfile] = useState(false);
  const [localAddress, setLocalAddress] = useState('');

  useEffect(() => {
    // Prevents server side mismatch with address. Idk why
    if (address) setLocalAddress(address);
  }, [address]);

  return (
    <>
      {localAddress && isValid ? (
        <div className="relative cursor-pointer" onClick={() => setOpenProfile(!openProfile)}>
          <div className="flex items-center gap-2 rounded-xl px-2 py-1 border border-white hover:scale-105 active:scale-100 transition-all">
            <UserAvatar width={30} userId={localAddress} />
            <FontAwesomeIcon icon={faAngleDown} color="#ffffff" />
          </div>
          {openProfile ? (
            <div className="max-w-[150px] absolute top-full right-0 bg-white mt-2 border border-gray-200 rounded-xl cursor-pointer">
              {isMobile && localAddress && isValid && (
                <>
                  <p className="secondary p-2">Wallet</p>
                  <div className="w-full flex justify-center">
                    <ConnectWallet />
                  </div>
                </>
              )}
              <p className="secondary p-2">My identities</p>
              <div className="border-b border-dotted border-gray-300">
                <a href={`/users/${localAddress}`}>
                  <div className="w-full flex justify-between gap-2 px-2 py-2.5 rounded-xl hover:bg-gray-100">
                    <div className="w-full flex justify-between items-center gap-2">
                      <div className="flex gap-2 w-full">
                        <UserAvatar type={NameType.DOXED} userId={localAddress} width={20} />
                        <p className="shrink overflow-hidden text-ellipsis whitespace-nowrap">
                          {name}
                        </p>
                      </div>
                    </div>
                  </div>
                </a>
                {nymOptions &&
                  nymOptions.map((nym) => (
                    <div
                      key={nym.nymSig}
                      className="w-full flex justify-between gap-2 px-2 py-2.5 rounded-xl hover:bg-gray-100"
                    >
                      <a href={`/users/${getUserIdFromName(nym)}`}>
                        <div className="w-full flex justify-between items-center gap-2">
                          <div className="flex gap-2 w-full">
                            <UserAvatar
                              type={NameType.PSEUDO}
                              userId={getUserIdFromName(nym)}
                              width={20}
                            />
                            <p className="shrink overflow-hidden text-ellipsis whitespace-nowrap">
                              {nym.name}
                            </p>
                          </div>
                        </div>
                      </a>
                    </div>
                  ))}
              </div>
              <div className="w-full flex justify-between gap-2 px-2 py-2.5 rounded-xl hover:bg-gray-100">
                <a href={`/users`}>
                  <div className="flex items-center gap-2 w-full">
                    <FontAwesomeIcon className="w-6" icon={faUser} />
                    <p>All Users</p>
                  </div>
                </a>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
};
