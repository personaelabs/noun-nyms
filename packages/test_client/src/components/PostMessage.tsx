import styles from "@/styles/Home.module.css";
import { MerkleProof } from "@personaelabs/spartan-ecdsa";
import { useState } from "react";

type Props = {
  nymCode: string;
  signedNymCode: string; // NOTE: private
  nymHash: string;
};

type ProofInputs = {
  nymCodeMsgHash: Buffer;
  signedNymCode: string; // NOTE: private
  nymHash: string;

  contentDataMsgHash: Buffer;
  signedContentData: string; // NOTE: private

  merkleProof: MerkleProof;
};

// NOTE: when replyign to a parent, parent probably needs to be passed in
export default function PostMessage({
  nymCode,
  signedNymCode,
  nymHash,
}: Props) {
  const [message, setMessage] = useState("");

  function handleMessageChange(event: any) {
    setMessage(event.target.value);
  }

  function generateProofInputs(): ProofInputs {
    // 1. ethers keccak nymCode
    // 2. ethers keccak message
    // 3. sign message
    // 4. pull merkle proof from wherever it's served
    throw new Error("not implemented");
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
