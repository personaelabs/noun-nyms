import ConnectWallet from './ConnectWallet';
import logo from '../../public/logo.svg';
import { MyProfile } from './MyProfile';
import Image from 'next/image';
import { useContext } from 'react';
import { UserContext } from '@/pages/_app';
import { UserContextType } from '@/types/components';
import { useAccount } from 'wagmi';
import { Notifications } from './notifications/Notifications';
import { useIsMounted } from '@/hooks/useIsMounted';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import text from '@/lib/text.json';

export const Header = () => {
  const TEXT = text.app.header;
  const { address } = useAccount();
  const { isMobile, isValid, pushRoute } = useContext(UserContext) as UserContextType;

  const isMounted = useIsMounted();

  return (
    <>
      {isMobile !== null && (
        <div className="bg-black dots w-full">
          <div className="flex flex-col gap-2 py-4 md:pt-6 md:pb-0">
            <nav className="w-full px-4 md:px-6 flex justify-between items-center">
              <div
                className="min-w-0 flex shrink gap-2 items-center cursor-pointer"
                onClick={() => pushRoute('/')}
              >
                <div>
                  <div className="w-[35px]">
                    <Image src={logo} alt="logo" />
                  </div>
                </div>
                {!isMobile && <h3 className="text-white font-semibold breakText">{TEXT.title}</h3>}
              </div>
              <div className="flex gap-4 items-center">
                {isMounted && address && isValid && <Notifications />}
                {(!isMobile || !address || !isValid) && <ConnectWallet />}
                {isMounted && address ? (
                  <MyProfile address={address} />
                ) : (
                  <button
                    className="flex items-center gap-2 rounded-xl px-2 py-1 h-10 border border-white hover:scale-105 active:scale-100 transition-all"
                    onClick={() => pushRoute('/users')}
                  >
                    <div className="flex gap-2 items-center">
                      <FontAwesomeIcon icon={faUsers} color={'#ffffff'} />
                      <p className="text-white font-semibold">{TEXT.allUsers}</p>
                    </div>
                  </button>
                )}
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
      )}
    </>
  );
};
