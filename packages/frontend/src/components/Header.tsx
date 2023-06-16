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
import { header as TEXT } from '@/lib/text';

export const Header = () => {
  const { address } = useAccount();
  const { isMobile, isValid, pushRoute } = useContext(UserContext) as UserContextType;

  const isMounted = useIsMounted();

  return (
    <>
      {isMobile !== null && (
        <div className="bg-black dots w-full">
          <div className="flex flex-col gap-2 py-3">
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
                {!isMobile && <h4 className="text-white font-semibold breakText">{TEXT.title}</h4>}
              </div>
              <div className="flex gap-4 items-center">
                {isMounted && address && isValid && <Notifications />}
                {(!isMobile || !address || !isValid) && <ConnectWallet />}
                {isMounted && address && <MyProfile address={address} />}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};
