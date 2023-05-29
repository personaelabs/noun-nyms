import { Textarea } from './Textarea';
import { useState, useMemo } from 'react';
import Spinner from '../global/Spinner';
import { MainButton } from '../MainButton';
import { postDoxed, postPseudo } from '@/lib/actions';
import { useAccount, useSignTypedData } from 'wagmi';
import { PrefixedHex } from '@personaelabs/nymjs';
import { NameSelect } from './NameSelect';
import { ClientName, NameType } from '@/types/components';
import { WalletWarning } from '../WalletWarning';
import { Modal } from '../global/Modal';
import { RetryError } from '../global/RetryError';
import useError from '@/hooks/useError';
import useUserInfo from '@/hooks/useUserInfo';

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
  const { errorMsg, isError, setError, clearError } = useError();

  const { address } = useAccount();
  const { isValid } = useUserInfo({ address: address });
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
    if (!address || !isValid) {
      setShowWalletWarning(true);
      return;
    } else {
      setShowWalletWarning(false);
      try {
        clearError();
        setSendingPost(true);
        if (!name) throw new Error('must select an identity to post');
        if (!body) throw new Error('post cannot be empty');
        if (parentId === '0x0' && !title) throw new Error('title cannot be empty');
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
        setError(error);
        setSendingPost(false);
      }
    }
  };

  return (
    <>
      {showWalletWarning ? (
        <WalletWarning handleClose={() => setShowWalletWarning(false)} action="comment" />
      ) : errorMsg && isError ? (
        <Modal width="50%" handleClose={clearError}>
          <div className="flex flex-col gap-4 py-8 px-12 md:px-12 md:py-10">
            <RetryError
              message="Could not submit post:"
              error={errorMsg}
              refetchHandler={sendPost}
            />
          </div>
        </Modal>
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
            {address && isValid ? (
              <NameSelect selectedName={name} setSelectedName={setName} />
            ) : null}
            <MainButton
              color="black"
              handler={sendPost}
              loading={sendingPost}
              message={'Send'}
              disabled={!body || (parentId === '0x0' && !title)}
            />
          </div>
        </div>
      ) : null}
    </>
  );
};
