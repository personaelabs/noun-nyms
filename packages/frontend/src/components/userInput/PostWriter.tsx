import { Textarea } from './Textarea';
import { useState, useContext, useEffect, useCallback } from 'react';
import { MainButton } from '../MainButton';
import { postDoxed, postPseudo } from '@/lib/actions';
import { useAccount, useSignTypedData } from 'wagmi';
import { PrefixedHex } from '@personaelabs/nymjs';
import { NameSelect } from './NameSelect';
import { ClientName, NameType, UserContextType } from '@/types/components';
import { WalletWarning } from '../WalletWarning';
import { Modal } from '../global/Modal';
import { RetryError } from '../global/RetryError';
import useError from '@/hooks/useError';
import { UserContext } from '@/pages/_app';
import useProver from '@/hooks/useProver';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

interface IWriterProps {
  parentId: PrefixedHex;
  scrollToPost: (id: string) => Promise<void>;
  handleCloseWriter?: () => void;
}

export const PostWriter = (props: IWriterProps) => {
  const { parentId, handleCloseWriter, scrollToPost } = props;
  const [body, setBody] = useState('');
  const [title, setTitle] = useState('');
  const [closeWriter, setCloseWriter] = useState(false);
  const [showWalletWarning, setShowWalletWarning] = useState(false);
  const [sendingPost, setSendingPost] = useState(false);
  const [hasSignedPost, setHasSignedPost] = useState(false);
  const [sentPost, setSentPost] = useState(false);
  const [userError, setUserError] = useState('');
  const { errorMsg, isError, setError, clearError } = useError();

  const { address } = useAccount();
  const { isMobile, isValid, setPostInProg, postInProg } = useContext(
    UserContext,
  ) as UserContextType;
  const [name, setName] = useState<ClientName | null>(null);
  const { signTypedDataAsync } = useSignTypedData();
  const signedHandler = () => setHasSignedPost(true);
  const prover = useProver({
    enableProfiler: true,
  });

  const clearErrors = useCallback(() => {
    clearError();
    setUserError('');
  }, [clearError]);

  useEffect(() => {
    setPostInProg(body || title ? true : false);
  }, [setPostInProg, body, title]);

  useEffect(() => {
    if (!postInProg) clearErrors();
  }, [postInProg, clearErrors]);

  useEffect(() => {
    // ensure that the writer does not close until postInProg is set to false
    if (!postInProg && closeWriter && handleCloseWriter) {
      handleCloseWriter();
    }
  }, [closeWriter, handleCloseWriter, postInProg]);

  const resetWriter = () => {
    setBody('');
    setTitle('');
    setCloseWriter(true);
  };

  const sendPost = async () => {
    if (!address || !isValid) {
      setShowWalletWarning(true);
      return;
    } else {
      setShowWalletWarning(false);
      try {
        clearErrors();
        setSendingPost(true);
        if (!name) {
          setUserError('must select an identity to post');
          return;
        }
        if (!body) {
          setUserError('post cannot be empty');
          return;
        }
        if (parentId === '0x0' && !title) {
          setUserError('title cannot be empty');
          return;
        }
        let result = undefined;
        if (name.type === NameType.DOXED) {
          result = await postDoxed({ title, body, parentId }, signTypedDataAsync, signedHandler);
        } else if (name.type === NameType.PSEUDO && name.name) {
          result = await postPseudo(
            prover,
            name.name,
            name.nymSig,
            { title, body, parentId },
            signTypedDataAsync,
            signedHandler,
          );
        } else {
          setUserError('must select a valid identity to post');
          return;
        }
        setSentPost(true);
        await scrollToPost(result?.data.postId);
        resetWriter();
      } catch (error) {
        setError(error);
      } finally {
        setSendingPost(false);
        setSentPost(false);
        setHasSignedPost(false);
      }
    }
  };

  return (
    <>
      {showWalletWarning ? (
        <WalletWarning handleClose={() => setShowWalletWarning(false)} action="comment" />
      ) : errorMsg && isError ? (
        <Modal width="50%" handleClose={clearErrors}>
          <div className="flex flex-col gap-4 py-8 px-12 md:px-12 md:py-10">
            <RetryError
              message="Could not submit post:"
              error={errorMsg}
              refetchHandler={sendPost}
            />
          </div>
        </Modal>
      ) : null}
      <div className="flex flex-col gap-2">
        {userError && <p className="error">Error: {userError}</p>}
        <div className="w-full flex flex-col gap-6 justify-center items-center">
          <div className="w-full flex flex-col gap-4">
            {parentId === '0x0' ? (
              <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-clip w-full">
                <Textarea
                  value={title}
                  placeholder="Add title"
                  minHeight={50}
                  onChangeHandler={(newVal) => setTitle(newVal)}
                ></Textarea>
              </div>
            ) : null}
            <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-clip w-full">
              <Textarea
                value={body}
                placeholder={parentId === '0x0' ? 'Description' : 'Type your post here'}
                minHeight={100}
                onChangeHandler={(newVal) => setBody(newVal)}
              ></Textarea>
            </div>
          </div>
          <div className="w-full flex-wrap flex gap-2 items-center justify-end text-gray-500">
            {address && isValid ? (
              <NameSelect
                openMenuAbove={isMobile && parentId === '0x0'}
                selectedName={name}
                setSelectedName={setName}
              />
            ) : null}
            <MainButton
              color="black"
              handler={sendPost}
              loading={sendingPost}
              message={'Send'}
              disabled={!body || (parentId === '0x0' && !title)}
            >
              {/* proving only happens for pseudo posts */}
              {hasSignedPost && sendingPost && name && name.type === NameType.PSEUDO ? (
                <p>
                  Proving<span className="dot1">.</span>
                  <span className="dot2">.</span>
                  <span className="dot3">.</span>
                </p>
              ) : sentPost ? (
                <div className="flex gap-1 items-center">
                  <p>Sent</p>
                  <FontAwesomeIcon icon={faCheck} />
                </div>
              ) : null}
            </MainButton>
          </div>
        </div>
      </div>
    </>
  );
};
