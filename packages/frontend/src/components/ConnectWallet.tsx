import WalletProvider from '@/components/example/Providers';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState } from 'react';
import { MainButton } from './MainButton';

export default function ConnectWallet() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const handleAuthentication = () => {
    setIsAuthenticated(true);
  };
  return (
    <WalletProvider>
      <ConnectButton.Custom>
        {({ account, mounted, chain, openConnectModal, authenticationStatus }) => {
          const ready = mounted && authenticationStatus !== 'loading';
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus || authenticationStatus === 'authenticated');

          return (
            // TODO: if authenticated, show avatar with associated nym accounts
            <MainButton
              message={connected ? 'connected' : 'Connect Wallet'}
              color="blue"
              loading={false}
              handler={openConnectModal}
            />
          );
        }}
      </ConnectButton.Custom>
    </WalletProvider>
  );
}
