import ConnectWallet from './ConnectWallet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { MyProfile } from './MyProfile';

export const Header = () => {
  return (
    <div className="bg-black dots w-full">
      <div className="flex flex-col gap-2 pt-8">
        <nav className="w-full px-6 flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <a href={'/'}>
              <FontAwesomeIcon icon={faHome} className="fa-xl" color="#ffffff" />
            </a>
            <h3 className="text-white">PseudoNym</h3>
          </div>
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
