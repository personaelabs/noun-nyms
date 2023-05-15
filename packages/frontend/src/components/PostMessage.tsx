import styles from '@/styles/Home.module.css';
import { MerkleProof } from '@personaelabs/spartan-ecdsa';
import { useState } from 'react';

type Props = {
  nymName: string;
  signednymName: string; // NOTE: private
  nymHash: string;
};

// TODO: make this a legitimate proof
const dummyMerkleProof: MerkleProof = {
  root: BigInt(1),
  siblings: [],
  pathIndices: [],
};

// NOTE: when replying to a parent, parent probably needs to be passed in
export default function PostMessage({ nymName, signednymName, nymHash }: Props) {
  const [message, setMessage] = useState('');

  function handleMessageChange(event: any) {
    setMessage(event.target.value);
    console.log('hello');
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
