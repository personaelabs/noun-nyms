import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { useState } from "react";

import { useSignMessage } from "wagmi";

import { buildPoseidon } from "circomlibjs";

export default function Home() {
  // TODO: conditionally set nymCode based on input
  const [nymCode, setNymCode] = useState("lsankar");
  const { signMessageAsync } = useSignMessage({
    message: nymCode,
  });

  const createNym = async () => {
    const signedNym = await signMessageAsync();

    const poseidon = await buildPoseidon();
    const F = poseidon.F;

    const nymHash = F.toObject(poseidon([signedNym])).toString(16);

    console.log(`nym: ${nymCode}-${nymHash}`);
  };

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
          <button onClick={() => createNym()}>create nym</button>
        </div>
      </main>
    </>
  );
}
