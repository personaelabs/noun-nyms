import { useQuery, QueryClientProvider, QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient();

import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet, polygon, optimism } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { InjectedConnector } from 'wagmi/connectors/injected';

const { chains, publicClient } = configureChains(
  [mainnet, polygon, optimism],
  [alchemyProvider({ apiKey: 'utNxwqiuLePqDOPaK-eQQonz5eXVT35C' }), publicProvider()],
);

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains,
});

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export default function ExampleProviders({ children }: { children: any }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={config}>
        <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
}
