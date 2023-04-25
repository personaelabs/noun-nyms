import styles from '../styles/Home.module.css';
import { Poseidon } from '@personaelabs/spartan-ecdsa';
import { fromRpcSig, ecrecover, hashPersonalMessage } from '@ethereumjs/util';
import { useState } from 'react';
import { useSignMessage } from 'wagmi';
import { NymProver, NymVerifier, ContentData, NymMessage } from '@personaelabs/nymjs';
import { constructDummyTree } from '../utils';

type Props = {
  nymCode: string;
  signedNymCode: string; // NOTE: private
  nymHash: string;
};

// NOTE: when replying to a parent, parent probably needs to be passed in
export default function PostMessage({ nymCode, signedNymCode, nymHash }: Props) {
  const [parentContentId, setParentContentId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const { signMessageAsync } = useSignMessage();

  function handleMessageChange(event: any) {
    setBody(event.target.value);
  }

  const postMessage = async () => {
    const contentData: ContentData = {
      title,
      parentContentId,
      body,
      timestamp: Math.round(Date.now() / 1000),
    };
    const message = JSON.stringify(contentData);

    const signedContentData = await signMessageAsync({
      message,
    });

    const poseidon = new Poseidon();
    await poseidon.initWasm();

    const contentSig = fromRpcSig(signedContentData);
    const contentHash = hashPersonalMessage(Buffer.from(message, 'utf8'));
    const proverPubKey = ecrecover(contentHash, contentSig.v, contentSig.r, contentSig.s);
    const proverPubKeyHash = poseidon.hashPubKey(proverPubKey);

    const tree = await constructDummyTree(poseidon);
    tree.insert(proverPubKeyHash);
    const membershipProof = tree.createProof(tree.indexOf(proverPubKeyHash));

    const config = {
      witnessGenWasm: 'http://localhost:3000/nym_ownership.wasm',
      circuitUrl: 'http://localhost:3000/nym_ownership.circuit',
      enableProfiler: true,
    };
    const prover = new NymProver(config);

    await prover.initWasm();

    const nymMessage: NymMessage = {
      nymCode,
      domainTag: 'nym',
      version: 1,
    };

    const proof = await prover.prove(
      membershipProof,
      message,
      signedContentData,
      nymMessage,
      signedNymCode,
    );
    console.log(`Successfully generated proof!`);

    const verifier = new NymVerifier(config);
    await verifier.initWasm();

    const isProofValid = await verifier.verify(proof.publicInput, proof.proof);
    if (isProofValid) {
      console.log(`Successfully verified proof!`);
    } else {
      console.log(`Failed to verify proof!`);
    }
  };

  return (
    <div>
      <div className={styles.description}>
        <input type="text" value={body} onChange={handleMessageChange} />

        <button onClick={() => postMessage()}>post message</button>
      </div>
    </div>
  );
}
