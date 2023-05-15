import WalletProvider from '@/components/example/Providers';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { MainButton } from './MainButton';

export default function ConnectWallet() {
  return (
    <WalletProvider>
      <ConnectButton.Custom>
        {({ openConnectModal }) => {
          return (
            <MainButton
              message={'Connect Wallet'}
              color="#0E76FD"
              loading={false}
              handler={openConnectModal}
            />
          );
        }}
      </ConnectButton.Custom>
    </WalletProvider>
  );
}
