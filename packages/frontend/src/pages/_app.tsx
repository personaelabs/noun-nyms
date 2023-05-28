import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { WagmiConfig, createConfig, mainnet } from 'wagmi';
import { createPublicClient, http } from 'viem';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HOME_DESCRIPTION, Seo, TITLE } from '@/components/global/Seo';
import Head from 'next/head';
import { User } from '@/components/global/User';

config.autoAddCss = false;

const appConfig = createConfig({
  autoConnect: true,
  publicClient: createPublicClient({
    chain: mainnet,
    transport: http(),
  }),
});

// React query client
const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={appConfig}>
        <User />
        <Head>
          <link type="favicon" rel="icon" href="/favicon-3.ico" />
        </Head>
        <Seo title={TITLE} description={HOME_DESCRIPTION} />
        <Component {...pageProps} />
      </WagmiConfig>
    </QueryClientProvider>
  );
}
