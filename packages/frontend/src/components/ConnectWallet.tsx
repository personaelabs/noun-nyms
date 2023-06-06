import WalletProvider from '@/components/global/Providers';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function ConnectWallet() {
  return (
    <WalletProvider>
      <ConnectButton chainStatus={'none'} accountStatus={'address'} showBalance={false} />
    </WalletProvider>
  );
}
