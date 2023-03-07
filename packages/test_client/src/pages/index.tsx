import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { useState } from "react";

import { useSignMessage } from "wagmi";

import { buildPoseidon } from "circomlibjs";

export default function Home() {
  const [nymCode, setNymCode] = useState("");
  const [nymHash, setNymHash] = useState("");
  const { signMessageAsync } = useSignMessage({
    message: nymCode,
  });

  function displayNym() {
    return `${nymCode}-${nymHash}`;
  }

  function handleNymCodeInputChange(event: any) {
    setNymCode(event.target.value);
  }

  const createNym = async () => {
    const signedNym = await signMessageAsync();

    const poseidon = await buildPoseidon();
    const F = poseidon.F;

    const nymHash = F.toObject(poseidon([signedNym])).toString(16);

    setNymHash(nymHash);

    // TODO: this should probably be handled with component state
    const nymCodeInput = document.getElementById(
      "nymCodeInput"
    ) as HTMLInputElement;
    nymCodeInput.readOnly = true;

    console.log(`nym: ${nymCode}-${nymHash}`);
  };

  return (
    <>
      <Head>
        <title>Nym test app</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ConnectButton />

      <main className={styles.main}>
        <div className={styles.description}>
          <input
            type="text"
            id="nymCodeInput"
            value={nymCode}
            onChange={handleNymCodeInputChange}
          />

          {nymHash.length > 0 && <p>nym: {displayNym()}</p>}

          <button onClick={() => createNym()}>select nym</button>
        </div>
      </main>
    </>
  );
}
