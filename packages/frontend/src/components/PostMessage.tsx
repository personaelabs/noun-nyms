import styles from '@/styles/Home.module.css';
import { MerkleProof } from '@personaelabs/spartan-ecdsa';
import { useState } from 'react';

import { useSignMessage } from 'wagmi';

type Props = {
  nymCode: string;
  signedNymCode: string; // NOTE: private
  nymHash: string;
};

// TODO: make this a legitimate proof
const dummyMerkleProof: MerkleProof = {
  root: BigInt(1),
  siblings: [],
  pathIndices: [],
};

// NOTE: when replying to a parent, parent probably needs to be passed in
export default function PostMessage({ nymCode, signedNymCode, nymHash }: Props) {
  const [message, setMessage] = useState('');
  const { signMessageAsync } = useSignMessage({
    message,
  });

  function handleMessageChange(event: any) {
    setMessage(event.target.value);
  }

  async function generateProofInputs(): Promise<void> {
    // TODO
  }

  const postMessage = async () => {
    // TODO
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
