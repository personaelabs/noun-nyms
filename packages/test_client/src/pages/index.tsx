import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { useState } from "react";

import { useSignMessage } from "wagmi";

import NymSelector from "@/components/NymSelector";

export default function Home() {
  // NOTE: nym-selector component
  const [nymCode, setNymCode] = useState("");
  const [nymHash, setNymHash] = useState("");

  const { signMessageAsync } = useSignMessage({
    message: nymCode,
  });

  function displayNym() {
    // NOTE: may want to shorten
    return `${nymCode}-${nymHash}`;
  }

  // NOTE: conversations component
  const [message, setMessage] = useState("");
  function handleMessageChange(event: any) {
    setMessage(event.target.value);
  }
  const postMessage = async () => {
    // TODO: generate proof, etc. and send message to server
    console.log(`message: ${message}`);
  };

  const onNymSelected = (nymCode: string, nymHash: string) => {
    setNymCode(nymCode);
    setNymHash(nymHash);

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

        {/* TODO: break out into 'conversations' component */}
        {nymHash.length > 0 && (
          <div>
            <div className={styles.description}>
              <input
                type="text"
                value={message}
                onChange={handleMessageChange}
              />

              <button onClick={() => postMessage()}>post message</button>
            </div>

            <div className={styles.description}>messages go here</div>
          </div>
        )}
      </main>
    </>
  );
}
