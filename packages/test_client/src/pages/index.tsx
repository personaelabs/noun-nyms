import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import { useEffect, useState } from 'react';

import NymSelector from '../components/NymSelector';
import PostMessage from '../components/PostMessage';
import { EIP712TypedData } from '@personaelabs/nymjs';

export default function Home() {
  const [typednymName, setTypednymName] = useState<EIP712TypedData | null>();
  const [nymHash, setNymHash] = useState('');
  const [signednymName, setSignednymName] = useState('');

  function displayNym() {
    // NOTE: may want to shorten
    return `${typednymName.value.nymName}-${nymHash}`;
  }

  const onNymSelected = (typednymName: EIP712TypedData, signednymName: string, nymHash) => {
    setTypednymName(typednymName);
    setNymHash(nymHash);
    setSignednymName(signednymName);
  };

  useEffect(() => {
    if (typednymName) {
      console.log(displayNym());
    }
  }, [typednymName]);

  return (
    <>
      <Head>
        <title>Nym test app</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ConnectButton />

      {/* NOTE: may not want this to live here exactly */}
      <div>{nymHash.length > 0 && <p>nym: {displayNym()}</p>}</div>

      <main className={styles.main}>
        <NymSelector onNymSelected={onNymSelected}></NymSelector>

        <br />

        {nymHash.length > 0 && (
          <PostMessage
            typednymName={typednymName}
            signednymName={signednymName}
            nymHash={nymHash}
          ></PostMessage>
        )}

        {/* TODO: discussions */}
      </main>
    </>
  );
}
