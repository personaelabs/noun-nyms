import { faAngleUp, faCircleUp, faSquare, faUpLong } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAccount, useSignTypedData } from 'wagmi';
import { submitUpvote } from '@/lib/actions';
import { useMemo, useState } from 'react';
import { UpvoteWarning } from './UpvoteWarning';
import { ClientUpvote } from '@/types/components';
import { ReactNode } from 'react';
import { WalletWarning } from './WalletWarning';
import { Modal } from './global/Modal';
import { RetryError } from './global/RetryError';

interface UpvoteIconProps {
  upvotes: ClientUpvote[];
  postId: string;
  children: ReactNode;
  col?: boolean;
  onSuccess: () => void;
}

export const Upvote = (props: UpvoteIconProps) => {
  const { address } = useAccount();
  const { upvotes, postId, col, children, onSuccess } = props;
  const { signTypedDataAsync } = useSignTypedData();

  const getHasUpvoted = () => {
    if (!address) return false;
    return upvotes.some((v) => v.address === address.toLowerCase());
  };

  const [showVoteWarning, setShowVoteWarning] = useState<boolean>(false);
  const [showWalletWarning, setShowWalletWarning] = useState<boolean>(false);
  const [loadingUpvote, setLoadingUpvote] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);

  const hasUpvoted = useMemo(getHasUpvoted, [address, upvotes]);

  const clearErrors = () => {
    setErrorMsg('');
    setIsError(false);
  };

  const upvoteHandler = async () => {
    try {
      clearErrors();
      setLoadingUpvote(true);
      await submitUpvote(postId, signTypedDataAsync);
      setLoadingUpvote(false);
      onSuccess();
      setShowVoteWarning(false);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMsg(error.message);
      }
      setIsError(true);
      setLoadingUpvote(false);
    }
  };

  const handleClick = () => {
    if (!address) {
      setShowWalletWarning(true);
      return;
    }
    if (hasUpvoted) return;
    setShowVoteWarning(true);
  };

  return (
    <>
      {errorMsg || isError ? (
        <Modal width="50%" handleClose={clearErrors}>
          <div className="flex flex-col gap-4 py-8 px-12 md:px-12 md:py-10">
            <RetryError
              message="Could not upvote:"
              error={errorMsg}
              refetchHandler={upvoteHandler}
            />
          </div>
        </Modal>
      ) : showVoteWarning ? (
        <UpvoteWarning
          handleClose={() => setShowVoteWarning(false)}
          upvoteHandler={upvoteHandler}
          loadingUpvote={loadingUpvote}
        />
      ) : showWalletWarning ? (
        <WalletWarning handleClose={() => setShowWalletWarning(false)} action="upvote" />
      ) : null}
      <div
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
        className={`flex ${
          col ? 'flex-col' : 'flex-row'
        } gap-2 justify-center items-center cursor-pointer`}
      >
        <div className="hoverIcon">
          <FontAwesomeIcon icon={faUpLong} color={hasUpvoted ? '#0e76fd' : ''} />
        </div>
        {children}
      </div>
    </>
  );
};
