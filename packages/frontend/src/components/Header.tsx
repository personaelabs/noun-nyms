import ConnectWallet from './ConnectWallet';
import logo from '../../public/logo.svg';
import { MyProfile } from './MyProfile';
import Image from 'next/image';

export const Header = () => {
  return (
    <div className="bg-black dots w-full">
      <div className="flex flex-col gap-2 pt-6">
        <nav className="w-full px-6 flex justify-between items-center">
          <a className="flex gap-2 items-center" href={'/'}>
            <div>
              <Image src={logo} alt="logo" />
            </div>
            <h3 className="text-white">PseudoNym</h3>
          </a>
          <div className="flex gap-2 items-center">
            <ConnectWallet />
            <MyProfile />
          </div>
        </nav>
        <div className="grow flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="w-[150px]" src="/nouns.png" alt="nouns" />
        </div>
      </div>
    </div>
  );
};
