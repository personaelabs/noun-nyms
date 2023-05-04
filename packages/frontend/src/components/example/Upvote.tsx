import { useCallback, useState } from 'react';
import axiosBase from 'axios';
import { DOMAIN, PrefixedHex, UPVOTE_TYPES } from '@personaelabs/nymjs';
import { useSignTypedData } from 'wagmi';
import { getLatestGroup } from '../../lib/example-utils';

const axios = axiosBase.create({
  baseURL: `http://localhost:3000/api/v1`,
});

const UpvoteExample = () => {
  const [postId, setPostId] = useState<string>('');
  const { signTypedDataAsync } = useSignTypedData();

  const handleUpvoteClick = useCallback(async () => {
    const group = await getLatestGroup();

    const upvote = {
      postId: ('0x' + postId?.replace('0x', '')) as PrefixedHex,
      groupRoot: ('0x' + group.root) as PrefixedHex,
      timestamp: Math.round(Date.now() / 1000),
    };

    const sig = await signTypedDataAsync({
      domain: DOMAIN,
      types: UPVOTE_TYPES,
      value: upvote,
    });

    await axios.post(`/posts/${postId}/upvote`, {
      groupRoot: upvote.groupRoot,
      timestamp: upvote.timestamp,
      sig,
    });
    console.log('Upvoted post', postId);
  }, [postId, signTypedDataAsync]);

  return (
    <div className="flex flex-col gap-4  mt-6  items-center">
      <p className="text-xl">Upvote</p>
      <div className="relative">
        <label className="text-gray-700 font-bold mb-2 block">Post ID</label>
        <input
          id="input"
          type="text"
          value={postId}
          onChange={(e) => setPostId(e.target.value)}
          className="border border-gray-400 p-3 rounded-lg w-full focus:outline-none focus:border-blue-500"
        />
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className="w-6 h-6 fill-current text-gray-400" viewBox="0 0 24 24">
            <path d="M5.293 6.293a1 1 0 011.414 0L12 11.586l5.293-5.293a1 1 0 011.414 1.414L13.414 13l5.293 5.293a1 1 0 01-1.414 1.414L12 14.414l-5.293 5.293a1 1 0 01-1.414-1.414L10.586 13 5.293 7.707a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
      <button
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleUpvoteClick}
      >
        Upvote a post
      </button>
    </div>
  );
};

/*
const getPubKey = async () => {
  const sig = await signMessageAsync();
  const { v, r, s } = fromRpcSig(sig as string);
  const msgHash = hashPersonalMessage(Buffer.from(pubKeyMessage, 'utf-8'));
  const pubKey = ecrecover(msgHash, v, r, s).toString('hex');
  console.log('pubKey', pubKey);
};

const getThread = async () => {
  // @ts-ignore
  const postId = document.getElementById('postId')?.value;
  const { data: thread } = await axios.get(`/posts/${postId}`);
  console.log('Thread starting from post:', postId);
  console.log(thread);
};
*/

export default UpvoteExample;
