import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { useSignMessage } from "wagmi";

export default function Home() {
  return (
    <>
      <Head>
        <title>Nym test app</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <ConnectButton />

        <div className={styles.description}>
          <p>
            Enter nym code:
            <input type="text" id="nym_code" placeholder=""></input>
          </p>

          {/* TODO: enter code, do signature + poseidon hash -> display name (and set as current name) */}
        </div>
      </main>
    </>
  );
}
