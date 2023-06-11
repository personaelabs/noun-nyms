import ConnectWallet from './ConnectWallet';
import logo from '../../public/logo.svg';
import { MyProfile } from './MyProfile';
import Image from 'next/image';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '@/pages/_app';
import { UserContextType } from '@/types/components';
import { useAccount } from 'wagmi';
import { Notifications } from './notifications/Notifications';
import { useIsMounted } from '@/hooks/useIsMounted';

export const Header = () => {
  const { address } = useAccount();
  const { isMobile, isValid, pushRoute } = useContext(UserContext) as UserContextType;

  const isMounted = useIsMounted();

  return (
    <>
      <div className="bg-black dots w-full">
        <div className="flex flex-col gap-2 py-4 md:pt-6 md:pb-0">
          <nav className="w-full px-4 md:px-6 flex justify-between items-center">
            <div
              className="min-w-0 flex shrink gap-2 items-center cursor-pointer"
              onClick={() => pushRoute('/')}
            >
              <div>
                <div className="w-[35px] md:w-auto">
                  <Image src={logo} alt="logo" />
                </div>
              </div>
              {!isMobile && <p className="text-white font-semibold breakText">PseudoNym</p>}
            </div>
            <div className="flex gap-4 items-center">
              {isMounted && address && isValid && <Notifications />}
              {(!isMobile || !address || !isValid) && <ConnectWallet />}
              {isMounted && address && <MyProfile address={address} />}
            </div>
          </nav>
          {!isMobile && (
            <div className="grow flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="w-[100px] md:w-[150px]" src="/nouns.png" alt="nouns" />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
