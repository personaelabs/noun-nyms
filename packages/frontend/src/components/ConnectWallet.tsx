import WalletProvider from '@/components/example/Providers';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { MainButton } from './MainButton';

export default function ConnectWallet() {
  return (
    <WalletProvider>
      <ConnectButton />
    </WalletProvider>
  );
}
