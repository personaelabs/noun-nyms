import '../styles/globals.css';
import type { AppProps } from 'next/app';

import { configureChains, createClient, defaultChains, WagmiConfig } from 'wagmi';

// import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from 'wagmi/providers/public';

import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

const { chains, provider } = configureChains(
  defaultChains,
  [publicProvider()], // TODO: add alchemyProvider
);

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains,
});

const client = createClient({
  autoConnect: true,
  connectors,
  provider,
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={client}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
