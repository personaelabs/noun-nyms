import { Textarea } from './Textarea';
import { useState, useMemo } from 'react';
import Spinner from '../global/Spinner';
import { MainButton } from '../MainButton';
import { postDoxed, postPseudo } from '@/lib/actions';
import { useAccount, useSignTypedData } from 'wagmi';
import { PrefixedHex } from '@personaelabs/nymjs';
import { NymSelect } from './NameSelect';
import { ClientName, NameType } from '@/types/components';
import { WalletWarning } from '../WalletWarning';

interface IWriterProps {
  parentId: PrefixedHex;
  onSuccess: (id: string) => void;
  handleCloseWriter?: () => void;
}

export const PostWriter = ({ parentId, handleCloseWriter, onSuccess }: IWriterProps) => {
  const [body, setPostMsg] = useState<string>('');
  const [title, setTitleMsg] = useState<string>('');
  const [showWalletWarning, setShowWalletWarning] = useState<boolean>(false);
  const [sendingPost, setSendingPost] = useState<boolean>(false);
  const [hasSignedPost, setHasSignedPost] = useState<boolean>(false);

  const { address } = useAccount();
  const [name, setName] = useState<ClientName | null>(null);
  const { signTypedDataAsync } = useSignTypedData();
  const signedHandler = () => setHasSignedPost(true);

  // TODO
  const someDbQuery = useMemo(() => true, []);

  // TODO
  const canPost = useMemo(() => true, []);

  const resetWriter = () => {
    if (handleCloseWriter) handleCloseWriter();
    setPostMsg('');
    setTitleMsg('');
  };

  const sendPost = async () => {
    if (!address) {
      setShowWalletWarning(true);
      return;
    } else if (!name) {
      console.log('must select an identity to post');
    } else
      try {
        setSendingPost(true);
        let result = undefined;
        if (name.type === NameType.DOXED) {
          result = await postDoxed({ title, body, parentId }, signTypedDataAsync);
        } else if (name.type === NameType.PSEUDO && name.name) {
          result = await postPseudo(
            name.name,
            name.nymSig,
            { title, body, parentId },
            signTypedDataAsync,
          );
        } else throw new Error('must select a valid identity to post');
        onSuccess(result?.data.postId);
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
              <NymSelect address={address} selectedName={name} setSelectedName={setName} />
            ) : null}
            <MainButton color="black" handler={sendPost} loading={sendingPost} message={'Send'} />
          </div>
        </div>
      ) : null}
    </>
  );
};
