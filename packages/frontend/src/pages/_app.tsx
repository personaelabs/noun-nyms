import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { WagmiConfig, configureChains, createConfig, mainnet, useAccount } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HOME_DESCRIPTION, Seo, TITLE } from '@/components/global/Seo';
import Head from 'next/head';
import { ValidUserWarning } from '@/components/global/ValidUserWarning';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { polygon, optimism } from 'viem/chains';
import { createContext, useEffect, useState } from 'react';
import useUserInfo from '@/hooks/useUserInfo';
import { UserContextType } from '@/types/components';
import usePushRoute from '@/hooks/usePushRoute';
import { RouteLoadingSpinner } from '@/components/global/RouteLoadingSpinner';
import { Header } from '@/components/Header';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorPage } from '@/components/global/ErrorPage';

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
export const UserContext = createContext<UserContextType | null>(null);

export default function App({ Component, pageProps }: AppProps) {
  const { address } = useAccount();
  const { nymOptions, setNymOptions, isValid } = useUserInfo({ address: address });
  const [isMobile, setIsMobile] = useState(false);
  const [postInProg, setPostInProg] = useState(false);
  const { routeLoading, pushRoute } = usePushRoute();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const ctxValue = {
    isMobile,
    nymOptions,
    setNymOptions,
    postInProg,
    setPostInProg,
    isValid,
    routeLoading,
    pushRoute,
  };

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={appConfig}>
        <UserContext.Provider value={ctxValue}>
          <ErrorBoundary fallback={<ErrorPage title={'Uh Oh!'} subtitle={'Error Unknown'} />}>
            <Head>
              <link type="favicon" rel="icon" href="/favicon-3.ico" />
            </Head>
            <Seo title={TITLE} description={HOME_DESCRIPTION} />
            {routeLoading && <RouteLoadingSpinner />}
            <Header />
            <Component {...pageProps} />
            <ValidUserWarning />
          </ErrorBoundary>
        </UserContext.Provider>
      </WagmiConfig>
    </QueryClientProvider>
  );
}
