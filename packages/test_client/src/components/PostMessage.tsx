import styles from '../styles/Home.module.css';
import { Poseidon } from '@personaelabs/spartan-ecdsa';
import { fromRpcSig, ecrecover } from '@ethereumjs/util';
import { useState } from 'react';
import { useSignTypedData } from 'wagmi';
import {
  NymProver,
  NymVerifier,
  EIP712TypedData,
  DOMAIN,
  CONTENT_DATA_TYPES,
  eip712MsgHash,
  AttestationScheme,
  HashScheme,
  serializeNymFullProof,
  computeContentId,
} from '@personaelabs/nymjs';
import { constructDummyTree } from '../utils';

type Props = {
  typedNymCode: EIP712TypedData;
  signedNymCode: string; // NOTE: private
  nymHash: string;
};

// NOTE: when replying to a parent, parent probably needs to be passed in
export default function PostMessage({ typedNymCode, signedNymCode, nymHash }: Props) {
  const [parentId, setParentId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const { signTypedDataAsync } = useSignTypedData();

  function handleMessageChange(event: any) {
    setBody(event.target.value);
  }

  const postMessage = async () => {
    const venue = 'nouns';
    const title = 'test title';
    const parentId = '';
    const timestamp = Math.round(Date.now() / 1000);

    const typedContentData: EIP712TypedData = {
      domain: DOMAIN,
      types: CONTENT_DATA_TYPES,
      value: {
        venue: 'nouns',
        title,
        parentId,
        body,
        timestamp,
      },
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
      enableProfiler: true,
    };

    const prover = new NymProver(config);
    await prover.initWasm();

    // Prove!
    const fullProof = await prover.prove(
      typedNymCode,
      typedContentData,
      signedNymCode,
      signedContentData,
      membershipProof,
    );
    console.log(`Successfully generated proof!`);

    const verifier = new NymVerifier(config);
    await verifier.initWasm();

    const isProofValid = await verifier.verify(fullProof);
    if (isProofValid) {
      console.log(`Successfully verified proof!`);
    } else {
      console.log(`Failed to verify proof!`);
    }

    const serializedFullProof = serializeNymFullProof(fullProof);

    // We can send the `Content` object using FormData

    const formData = new FormData();
    formData.append(
      'content',
      JSON.stringify({
        venue,
        title,
        parentId,
        body,
        timestamp,
        attestationScheme: AttestationScheme.Nym,
        hashScheme: HashScheme.Keccak256,
      }),
    );

    formData.append('fullProof', new Blob([serializedFullProof]));
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
