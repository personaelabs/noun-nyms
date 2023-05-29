import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient();

import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

import { configureChains } from 'wagmi';
import { mainnet, polygon, optimism } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

const { chains } = configureChains([mainnet, polygon, optimism], [publicProvider()]);

export default function RainbowProviders({ children }: { children: any }) {
  return <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>;
}
