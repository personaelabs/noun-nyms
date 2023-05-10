import type { AppProps } from 'next/app';
import '@/styles/globals.css';

import { WagmiConfig, createClient } from 'wagmi';
import { getDefaultProvider } from 'ethers';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const client = createClient({
  autoConnect: true,
  provider: getDefaultProvider(),
});

// React query client
const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig client={client}>
        <Component {...pageProps} />
      </WagmiConfig>
    </QueryClientProvider>
  );
}
