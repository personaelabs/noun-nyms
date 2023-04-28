import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import { useEffect, useState } from 'react';

import NymSelector from '../components/NymSelector';
import PostMessage from '../components/PostMessage';
import { EIP712TypedData } from '@personaelabs/nymjs';

export default function Home() {
  const [typedNymCode, setTypedNymCode] = useState<EIP712TypedData | null>();
  const [nymHash, setNymHash] = useState('');
  const [signedNymCode, setSignedNymCode] = useState('');

  function displayNym() {
    // NOTE: may want to shorten
    return `${typedNymCode.value.nymCode}-${nymHash}`;
  }

  const onNymSelected = (typedNymCode: EIP712TypedData, signedNymCode: string, nymHash) => {
    setTypedNymCode(typedNymCode);
    setNymHash(nymHash);
    setSignedNymCode(signedNymCode);
  };

  useEffect(() => {
    if (typedNymCode) {
      console.log(displayNym());
    }
  }, [typedNymCode]);

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
            typedNymCode={typedNymCode}
            signedNymCode={signedNymCode}
            nymHash={nymHash}
          ></PostMessage>
        )}

        {/* TODO: discussions */}
      </main>
    </>
  );
}
