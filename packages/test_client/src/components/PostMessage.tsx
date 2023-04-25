import styles from '../styles/Home.module.css';
import { Poseidon } from '@personaelabs/spartan-ecdsa';
import { fromRpcSig, ecrecover } from '@ethereumjs/util';
import { useState } from 'react';
import { useSignTypedData } from 'wagmi';
import {
  NymProver,
  NymVerifier,
  ContentData,
  EIP712TypedValue,
  DOMAIN,
  CONTENT_DATA_TYPES,
  eip712MsgHash,
} from '@personaelabs/nymjs';
import { constructDummyTree } from '../utils';

type Props = {
  typedNymCode: EIP712TypedValue;
  signedNymCode: string; // NOTE: private
  nymHash: string;
};

// NOTE: when replying to a parent, parent probably needs to be passed in
export default function PostMessage({ typedNymCode, signedNymCode, nymHash }: Props) {
  const [parentContentId, setParentContentId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const { signTypedDataAsync } = useSignTypedData();

  function handleMessageChange(event: any) {
    setBody(event.target.value);
  }

  const postMessage = async () => {
    // Prepare content data
    const contentData: ContentData = {
      venue: 'nouns',
      title,
      parentContentId,
      body,
      timestamp: Math.round(Date.now() / 1000),
    };

    const typedContentData: EIP712TypedValue = {
      domain: DOMAIN,
      types: CONTENT_DATA_TYPES,
      value: contentData,
    };

    // Request signature from user
    // @ts-ignore
    const signedContentData = await signTypedDataAsync(typedContentData);

    const contentSig = fromRpcSig(signedContentData);
    const contentHash = eip712MsgHash(
      typedContentData.domain,
      typedContentData.types,
      typedContentData.value,
    );

    // Construct a dummy Merkle tree and generate a Merkle proof
    const proverPubKey = ecrecover(contentHash, contentSig.v, contentSig.r, contentSig.s);

    const poseidon = new Poseidon();
    await poseidon.initWasm();

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

    // Prove!
    const proof = await prover.prove(
      membershipProof,
      typedContentData,
      signedContentData,
      typedNymCode,
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
