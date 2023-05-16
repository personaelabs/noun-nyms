import WalletProvider from '@/components/example/Providers';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function ConnectWallet() {
  return (
    <WalletProvider>
      <ConnectButton />
    </WalletProvider>
  );
}
