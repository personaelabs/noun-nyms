import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { WagmiConfig, configureChains, createConfig, mainnet } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HOME_DESCRIPTION, Seo, TITLE } from '@/components/global/Seo';
import Head from 'next/head';
import { ValidUserWarning } from '@/components/global/ValidUserWarning';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { polygon, optimism } from 'viem/chains';

config.autoAddCss = false;

const { chains, publicClient } = configureChains([mainnet, polygon, optimism], [publicProvider()]);

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains,
});

const appConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

// React query client
const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={appConfig}>
        <Head>
          <link type="favicon" rel="icon" href="/favicon-3.ico" />
        </Head>
        <Seo title={TITLE} description={HOME_DESCRIPTION} />
        <Component {...pageProps} />
        <ValidUserWarning />
      </WagmiConfig>
    </QueryClientProvider>
  );
}
