import { useQuery, QueryClientProvider, QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient();

import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet, polygon, optimism } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { InjectedConnector } from 'wagmi/connectors/injected';

const { chains, publicClient } = configureChains(
  [mainnet, polygon, optimism],
  [alchemyProvider({ apiKey: 'yourAlchemyApiKey' }), publicProvider()],
);

const config = createConfig({
  autoConnect: true,
  connectors: [new InjectedConnector({ chains })],
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
