import ConnectWallet from './ConnectWallet';
import logo from '../../public/logo.svg';
import { MyProfile } from './MyProfile';
import Image from 'next/image';
import { useContext } from 'react';
import { UserContext } from '@/pages/_app';
import { UserContextType } from '@/types/components';

export const Header = () => {
  const { isMobile } = useContext(UserContext) as UserContextType;
  return (
    <div className="bg-black dots w-full">
      <div className="flex flex-col gap-2 py-3 md:pt-6 md:pb-0">
        <nav className="w-full px-3 md:px-6 flex justify-between items-center">
          <a className="flex gap-2 items-center" href={'/'}>
            <div>
              <div className="w-[35px] md:w-auto">
                <Image src={logo} alt="logo" />
              </div>
            </div>
            {isMobile ? (
              <h4 className="text-white">PseudoNym</h4>
            ) : (
              <h3 className="text-white">PseudoNym</h3>
            )}
          </a>
          <div className="flex gap-2 items-center">
            {!isMobile && <ConnectWallet />}
            <MyProfile />
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
  );
};
