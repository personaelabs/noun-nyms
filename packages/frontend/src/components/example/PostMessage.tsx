import { useEffect, useState } from 'react';
import axiosBase from 'axios';
import {
  NYM_CODE_TYPE,
  NymProver,
  eip712MsgHash,
  DOMAIN,
  Content,
  AttestationScheme,
  toTypednymName,
  CONTENT_MESSAGE_TYPES,
  PrefixedHex,
  EIP712TypedData,
} from '@personaelabs/nymjs';
import { MerkleProof } from '@personaelabs/spartan-ecdsa';
import { ecrecover, fromRpcSig } from '@ethereumjs/util';
import { useSignTypedData, useAccount } from 'wagmi';

const axios = axiosBase.create({
  baseURL: `/api/v1`,
});

type Member = {
  pubkey: string;
  path: string[];
  indices: number[];
};

type ContentUserInput = {
  title: string;
  body: string;
  parentId: PrefixedHex;
};

const submitPost = async (
  content: Content,
  attestation: string,
  attestationScheme: AttestationScheme,
) => {
  const result = await axios.post(`/posts`, {
    content,
    attestation,
    attestationScheme,
  });

  return result;
};

const getLatestGroup = async () => {
  const { data } = await axios.get('/groups/latest?set=1');

  const group: {
    root: PrefixedHex;
    members: Member[];
  } = data;

  return group;
};

export const postDoxed = async (doxedContentInput: ContentUserInput, signTypedDataAsync: any) => {
  const group = await getLatestGroup();

  // Construct the content to sign
  const content: Content = {
    venue: 'nouns',
    title: doxedContentInput.title,
    body: doxedContentInput.body,
    parentId: doxedContentInput.parentId ? doxedContentInput.parentId : '0x0',
    groupRoot: group.root,
    timestamp: Math.round(Date.now() / 1000),
  };

  // Request the user to sign the content
  const attestation = await signTypedDataAsync({
    primaryType: 'Post',
    domain: DOMAIN,
    types: CONTENT_MESSAGE_TYPES,
    message: content,
  });

  const result = await submitPost(content, attestation, AttestationScheme.EIP712);

  console.log('Created a non-pseudonymous post! postId', result.data.postId);
};

export const postPseudo = async (
  nymName: string,
  nymSig: any,
  nymContentInput: ContentUserInput,
  signTypedDataAsync: any,
) => {
  if (nymName && nymSig) {
    const group = await getLatestGroup();
    const typednymName = toTypednymName(nymName);
    const userPubKey = getPubKeyFromEIP712Sig(typednymName, nymSig);

    // Get the user's merkle proof
    const userMerkleProof = group.members.find((member) => member.pubkey === userPubKey);

    // Throw if merkle proof not found (implies user not in set)
    if (!userMerkleProof) {
      throw new Error('User not found in set');
    }

    const merkleProof: MerkleProof = {
      pathIndices: userMerkleProof?.indices,
      siblings: userMerkleProof?.path.map((sibling) => BigInt(sibling)),
      root: BigInt(group.root),
    };

    // Construct the content to sign
    const content: Content = {
      venue: 'nouns',
      title: nymContentInput.title,
      body: nymContentInput.body,
      parentId: nymContentInput.parentId ? nymContentInput.parentId : '0x0',
      groupRoot: group.root,
      timestamp: Math.round(Date.now() / 1000),
    };

    // Request the user to sign the content
    const contentSig = await signTypedDataAsync({
      primaryType: 'Post',
      domain: DOMAIN,
      types: CONTENT_MESSAGE_TYPES,
      message: content,
    });

    // Setup the prover
    const nymProver = new NymProver({
      enableProfiler: true,
    });

    await nymProver.initWasm();

    // Generate the proof
    const attestation = await nymProver.prove(
      nymName,
      content,
      nymSig as string,
      contentSig as string,
      merkleProof,
    );

    const attestationHex = Buffer.from(attestation).toString('hex');

    const result = await submitPost(content, attestationHex, AttestationScheme.Nym);
    console.log('Created a pseudonymous post! postId', result.data.postId);
  }
};

const getPubKeyFromEIP712Sig = (typedData: EIP712TypedData, sig: string): string => {
  const { v, r, s } = fromRpcSig(sig);
  return `0x${ecrecover(
    eip712MsgHash(typedData.domain, typedData.types, typedData.value),
    v,
    r,
    s,
  ).toString('hex')}`;
};

const ExamplePost = () => {
  const { address } = useAccount();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  const [nymName, setnymName] = useState<string>('');
  const [doxedContentInput, setDoxedContentInput] = useState<ContentUserInput>({
    title: 'This is the title of a doxed post',
    body: 'This is the body of a doxed post',
    parentId: '0x0',
  });

  const [nymContentInput, setNymContentInput] = useState<ContentUserInput>({
    title: 'This is the title of a Nym post',
    body: 'This is the body of a Nym post',
    parentId: '0x0',
  });

  const { data: nymSig, signTypedData: signnymName } = useSignTypedData({
    primaryType: 'Nym',
    domain: DOMAIN,
    types: NYM_CODE_TYPE,
    message: {
      nymName,
    },
  });

  const { signTypedDataAsync } = useSignTypedData();

  return (
    <div className="flex flex-row gap-16 mt-4 justify-center">
      <div>
        <p className="text-xl">Doxed post</p>
        <p className="text-gray-700 font-bold mb-2 block mt-4">Your address</p>
        <p className="text-gray-700 font-bold mb-2 block">{hydrated && address}</p>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => postDoxed(doxedContentInput, signTypedDataAsync)}
        >
          Submit a doxed post
        </button>
        <div className="py-2 mt-4">
          <input
            id="input"
            type="text"
            placeholder="Parent ID (optional)"
            className="border border-gray-400 p-3 rounded-lg focus:outline-none focus:border-blue-500"
            value={doxedContentInput.parentId === '0x0' ? '' : doxedContentInput.parentId}
            onChange={(e) =>
              setDoxedContentInput({
                ...doxedContentInput,
                parentId: e.target.value as PrefixedHex,
              })
            }
          />
        </div>
      </div>

      <div>
        <p className="text-xl">Pseudonymous post</p>
        <div className="relative mt-4">
          <label className="text-gray-700 font-bold mb-2 block">Your Nym</label>
          <input
            id="input"
            type="text"
            className="border border-gray-400 p-3 rounded-lg w-full focus:outline-none focus:border-blue-500"
            value={nymName}
            onChange={(e) => setnymName(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-6 h-6 fill-current text-gray-400" viewBox="0 0 24 24">
              <path d="M5.293 6.293a1 1 0 011.414 0L12 11.586l5.293-5.293a1 1 0 011.414 1.414L13.414 13l5.293 5.293a1 1 0 01-1.414 1.414L12 14.414l-5.293 5.293a1 1 0 01-1.414-1.414L10.586 13 5.293 7.707a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
        <div className="flex flex-col">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            // @ts-expect-error signnymName is the function from signTypedData and has a type error.
            onClick={signnymName}
            disabled={nymName !== '' && !nymSig ? false : true}
          >
            Sign Nym code
          </button>
          <input
            id="input"
            type="text"
            className="mt-4 border border-gray-400 p-3 rounded-lg w-full focus:outline-none focus:border-blue-500"
            value={nymContentInput.parentId === '0x0' ? '' : nymContentInput.parentId}
            placeholder="Parent ID (optional)"
            onChange={(e) =>
              setNymContentInput({
                ...nymContentInput,
                parentId: e.target.value as PrefixedHex,
              })
            }
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            onClick={() => postPseudo(nymName, nymSig, nymContentInput, signTypedDataAsync)}
            disabled={!nymSig ? true : false}
          >
            Submit a pseudonymous post
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamplePost;
