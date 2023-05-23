import type { AppProps } from 'next/app';
import '@/styles/globals.css';

import { WagmiConfig, createConfig, mainnet } from 'wagmi';
import { createPublicClient, http } from 'viem';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Head from '@/components/global/Head';

const config = createConfig({
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
      <WagmiConfig config={config}>
        <Head />
        <Component {...pageProps} />
      </WagmiConfig>
    </QueryClientProvider>
  );
}
