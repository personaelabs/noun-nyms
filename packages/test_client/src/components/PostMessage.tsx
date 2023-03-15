import styles from "@/styles/Home.module.css";
import { MerkleProof } from "@personaelabs/spartan-ecdsa";
import { useState } from "react";

import { ethers } from "ethers";
import { useSignMessage } from "wagmi";

type Props = {
  nymCode: string;
  signedNymCode: string; // NOTE: private
  nymHash: string;
};

// NOTE: should put this in prover file
type ProofInputs = {
  nymCodeMsgHash: string;
  signedNymCode: string; // NOTE: private
  nymHash: string;

  contentDataMsgHash: string;
  signedContentData: string; // NOTE: private

  merkleProof: MerkleProof;
};

// TODO: make this a legitimate proof
const dummyMerkleProof: MerkleProof = {
  root: BigInt(1),
  siblings: [],
  pathIndices: [],
};

// NOTE: when replying to a parent, parent probably needs to be passed in
export default function PostMessage({
  nymCode,
  signedNymCode,
  nymHash,
}: Props) {
  const [message, setMessage] = useState("");
  const { signMessageAsync } = useSignMessage({
    message,
  });

  function handleMessageChange(event: any) {
    setMessage(event.target.value);
  }

  async function generateProofInputs(): Promise<ProofInputs> {
    const nymCodeMsgHash = ethers.utils.hashMessage(nymCode);

    const contentDataMsgHash = ethers.utils.hashMessage(message);
    const signedContentData = await signMessageAsync();

    const merkleProof = dummyMerkleProof;

    return {
      nymCodeMsgHash,
      signedNymCode,
      nymHash,

      contentDataMsgHash,
      signedContentData,

      merkleProof,
    };
  }

  const postMessage = async () => {
    const proofInputs = generateProofInputs();

    // TODO: construct proof

    console.log(`message: ${message}`);
  };

  return (
    <div>
      <div className={styles.description}>
        <input type="text" value={message} onChange={handleMessageChange} />

        <button onClick={() => postMessage()}>post message</button>
      </div>
    </div>
  );
}
