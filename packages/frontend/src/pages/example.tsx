import { useCallback, useEffect, useState } from 'react';
import axiosBase from 'axios';
import {
  NYM_CODE_TYPE,
  NymProver,
  eip712MsgHash,
  DOMAIN,
  ContentMessage,
  AttestationScheme,
  CONTENT_DATA_TYPES,
  toTypedNymCode,
} from '@personaelabs/nymjs';
import { MerkleProof } from '@personaelabs/spartan-ecdsa';
import { ecrecover, fromRpcSig } from '@ethereumjs/util';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { useSignTypedData, useConnect, useAccount } from 'wagmi';

const axios = axiosBase.create({
  baseURL: `http://localhost:3000/api/v1`,
});

type Member = {
  pubkey: string;
  path: string[];
  indices: number[];
};

const venue = 'nouns';

export default function Example() {
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { address, isConnected } = useAccount();
  const [nymCode, setNymCode] = useState<string>('satoshi');
  const [contentMessage, setContentMessage] = useState({
    title: 'title',
    body: 'body',
    parentId: '',
    timestamp: Math.round(Date.now() / 1000),
    venue,
  });

  const { signTypedDataAsync: signNymCode } = useSignTypedData({
    domain: DOMAIN,
    types: NYM_CODE_TYPE,
    value: { nymCode },
  });

  const { signTypedDataAsync: signContentMessage } = useSignTypedData({
    domain: DOMAIN,
    types: CONTENT_DATA_TYPES,
    value: contentMessage,
  });

  const postDoxed = async () => {
    const attestation = await signContentMessage();

    const result = await axios.post(`/posts`, {
      contentMessage,
      attestation,
      attestationScheme: AttestationScheme.EIP712,
    });

    console.log('Created a non-pseudonymous post! contentId', result.data.contentId);
  };

  const postPseudo = useCallback(async () => {
    if (nymCode) {
      const nymSig = await signNymCode();
      const contentMessageSig = await signContentMessage();

      const { data } = await axios.get('/groups/latest?set=2');
      const root: string = data.root;
      const members: Member[] = data.members;

      const typedNymCode = toTypedNymCode(nymCode);
      const { v, r, s } = fromRpcSig(nymSig as string);
      const proverPubKey = ecrecover(
        eip712MsgHash(typedNymCode.domain, typedNymCode.types, typedNymCode.value),
        v,
        r,
        s,
      ).toString('hex');

      const proverInSet = members.find((member) => member.pubkey === proverPubKey);

      if (!proverInSet) {
        throw new Error('Prover not found in set');
      }

      const merkleProof: MerkleProof = {
        pathIndices: proverInSet?.indices,
        siblings: proverInSet?.path.map((sibling) => BigInt('0x' + sibling)),
        root: BigInt('0x' + root),
      };

      const nymProver = new NymProver({
        enableProfiler: true,
      });

      await nymProver.initWasm();

      const attestation = await nymProver.prove(
        nymCode,
        contentMessage,
        nymSig as string,
        contentMessageSig as string,
        merkleProof,
      );

      const attestationHex = Buffer.from(attestation).toString('hex');

      const result = await axios.post(`posts`, {
        contentMessage,
        attestation: attestationHex,
        attestationScheme: AttestationScheme.Nym,
      });
      console.log('Created a pseudonymous post! postId', result.data.contentId);
    }
  }, [nymCode]);

  /*
  const upvote = async () => {
    // @ts-ignore
    const postId = document.getElementById('upvotePostId')?.value;

    const pubKey = ecrecover(msgHash, v, r, s);
    const address = pubToAddress(pubKey).toString('hex');

    const sig = `${r.toString('hex')}${s.toString('hex')}${v.toString(16)}`;

    await axios.post(`/posts/${postId}/upvote`, {
      sig,
      timestamp,
      address,
    });
    console.log('Upvoted post', postId);
  };
  */

  const getThread = async () => {
    // @ts-ignore
    const postId = document.getElementById('postId')?.value;
    const { data: thread } = await axios.get(`/posts/${postId}`);
    console.log('Thread starting from post:', postId);
    console.log(thread);
  };

  return (
    <>
      <div>
        <button
          onClick={() => {
            connect();
          }}
        >
          Connect
        </button>
        <div>
          <button onClick={postDoxed}>Doxed post</button>
          <input type="text" id="doxedPostParentId" placeholder="parentId (optional)" />
        </div>
        <div>
          <button onClick={postPseudo}>Pseudo post</button>
          <input type="text" id="pseudoPostParentId" placeholder="parentId (optional)" />
        </div>
        <div>
          <input type="text" id="upvotePostId" placeholder="postId" />
        </div>
        <div>
          <button onClick={getThread}>getThread</button>
          <input type="text" id="postId" placeholder="postId"></input>
        </div>
      </div>
    </>
  );
}
