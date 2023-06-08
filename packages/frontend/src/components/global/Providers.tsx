import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { configureChains } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

const { chains } = configureChains([mainnet], [publicProvider()]);

export default function RainbowProviders({ children }: { children: any }) {
  return <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>;
}
