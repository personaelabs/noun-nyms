import { Textarea } from './Textarea';
import { useState, useMemo } from 'react';
import Spinner from '../global/Spinner';
import { MainButton } from '../MainButton';
import { postDoxed, postPseudo } from '@/lib/actions';
import { useAccount, useSignTypedData } from 'wagmi';
import { PrefixedHex } from '@personaelabs/nymjs';
import { NymSelect } from './NymSelect';
import { ClientNym } from '@/types/components';
import { WalletWarning } from '../WalletWarning';

interface IWriterProps {
  parentId: PrefixedHex;
  onSuccess: () => void;
  handleCloseWriter?: () => void;
}

export const PostWriter = ({ parentId, handleCloseWriter, onSuccess }: IWriterProps) => {
  //TODO: render title box if no postId exists (distinguish between reply and top-level post)
  const [body, setPostMsg] = useState<string>('');
  const [title, setTitleMsg] = useState<string>('');
  const [showWalletWarning, setShowWalletWarning] = useState<boolean>(false);
  const [sendingPost, setSendingPost] = useState<boolean>(false);
  const [hasSignedPost, setHasSignedPost] = useState<boolean>(false);

  const { address } = useAccount();
  const [nym, setNym] = useState<ClientNym>({
    nymSig: '0x0',
    nymHash: '',
    nymName: address as string,
  });
  const { signTypedDataAsync } = useSignTypedData();
  const signedHandler = () => setHasSignedPost(true);

  // TODO
  const someDbQuery = useMemo(() => true, []);

  // TODO
  const canPost = useMemo(() => true, []);

  if (hasSignedPost) console.log('scroll to where post will be');

  const resetWriter = () => {
    if (handleCloseWriter) handleCloseWriter();
    setPostMsg('');
    setTitleMsg('');
  };

  const sendPost = async () => {
    if (!address) {
      setShowWalletWarning(true);
      return;
    }
    try {
      setSendingPost(true);
      const result =
        nym.nymName === address
          ? await postDoxed({ title, body, parentId }, signTypedDataAsync, signedHandler)
          : await postPseudo(
              nym.nymName,
              nym.nymSig,
              { title, body, parentId },
              signTypedDataAsync,
              signedHandler,
            );
      console.log('submitted a post: ', result?.data.postId);
      onSuccess();
      resetWriter();
      setSendingPost(false);
    } catch (error) {
      setSendingPost(false);
      //TODO: error handling
      console.error(error);
    }
  };

  return (
    <>
      {showWalletWarning ? (
        <WalletWarning handleClose={() => setShowWalletWarning(false)} action="comment" />
      ) : null}
      {someDbQuery === undefined ? (
        <div className="bg-gray-100 border border-gray-300 p-12 py-24 rounded-md flex justify-center text-gray-800">
          <Spinner />
        </div>
      ) : canPost ? (
        <div className="w-full flex flex-col gap-6 justify-center items-center">
          <div className="w-full flex flex-col gap-4">
            {parentId === '0x0' ? (
              <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-clip w-full">
                <Textarea
                  value={title}
                  placeholder="Add title"
                  minHeight={50}
                  onChangeHandler={(newVal) => setTitleMsg(newVal)}
                ></Textarea>
              </div>
            ) : null}
            <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-clip w-full">
              <Textarea
                value={body}
                placeholder={parentId === '0x0' ? 'Description' : 'Type your post here'}
                minHeight={100}
                onChangeHandler={(newVal) => setPostMsg(newVal)}
              ></Textarea>
            </div>
          </div>
          <div className="w-full flex gap-2 items-center justify-end text-gray-500">
            {address ? (
              <NymSelect address={address} selectedNym={nym} setSelectedNym={setNym} />
            ) : null}
            <MainButton color="black" handler={sendPost} loading={sendingPost} message={'Send'} />
          </div>
        </div>
      ) : null}
    </>
  );
};
