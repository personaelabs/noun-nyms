import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { useState } from "react";

import NymSelector from "@/components/NymSelector";
import PostMessage from "@/components/PostMessage";

export default function Home() {
  const [nymCode, setNymCode] = useState("");
  const [nymHash, setNymHash] = useState("");
  const [signedNymCode, setSignedNymCode] = useState("");

  function displayNym() {
    // NOTE: may want to shorten
    return `${nymCode}-${nymHash}`;
  }

  const onNymSelected = (
    nymCode: string,
    nymHash: string,
    signedNymCode: string
  ) => {
    setNymCode(nymCode);
    setNymHash(nymHash);
    setSignedNymCode(signedNymCode);

    console.log(displayNym());
  };

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
            nymCode={nymCode}
            signedNymCode={signedNymCode}
            nymHash={nymHash}
          ></PostMessage>
        )}

        {/* TODO: discussions */}
      </main>
    </>
  );
}
