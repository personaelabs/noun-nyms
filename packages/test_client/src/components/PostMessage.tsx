import styles from '@/styles/Home.module.css';
import { Poseidon } from '@personaelabs/spartan-ecdsa';
import { fromRpcSig, ecrecover, hashPersonalMessage } from '@ethereumjs/util';
import { useState } from 'react';
import { useSignMessage } from 'wagmi';
import { NymProver, NymProofInput, prepareInput } from '@personaelabs/nymjs';
import { constructDummyTree } from '../utils';

type Props = {
  nymCode: string;
  signedNymCode: string; // NOTE: private
  nymHash: string;
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

  async function generateProofInputs(): Promise<NymProofInput> {
    const signedContentData = await signMessageAsync();

    const poseidon = new Poseidon();
    await poseidon.initWasm();

    const tree = await constructDummyTree(poseidon);
    const sig = fromRpcSig(signedContentData);
    const contentHash = hashPersonalMessage(Buffer.from(message, 'utf8'));
    const proverPubKey = ecrecover(contentHash, sig.v, sig.r, sig.s);
    const proverPubKeyHash = poseidon.hashPubKey(proverPubKey);
    tree.insert(proverPubKeyHash);
    const membershipProof = tree.createProof(tree.indexOf(proverPubKeyHash));

    const input = await prepareInput(
      membershipProof,
      message,
      signedContentData,
      nymCode,
      signedNymCode,
    );

    return input;
  }

  const postMessage = async () => {
    const proofInputs = await generateProofInputs();

    const prover = new NymProver({
      witness_gen_wasm_url: 'http://localhost:3000/nym_ownership.wasm',
      circuit_url: 'http://localhost:3000/nym_ownership.circuit',
      enableProfiler: true,
    });

    // TODO: Fix failing wasm init
    // Commenting proving out until wasm init is fixed
    /**
    await prover.initWasm();
    const proof = await prover.prove(proofInputs);
    console.log(proof);
    console.log(`Successfully generated proof!`);
    */
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
