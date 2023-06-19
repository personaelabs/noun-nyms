import { faCircleUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAccount, useSignTypedData } from 'wagmi';
import { submitUpvote } from '@/lib/actions';
import { useContext, useMemo, useRef, useState } from 'react';
import { UpvoteWarning } from './UpvoteWarning';
import { ClientUpvote, UserContextType } from '@/types/components';
import { ReactNode } from 'react';
import { WalletWarning } from './WalletWarning';
import { Modal } from './global/Modal';
import { RetryError } from './global/RetryError';
import useError from '@/hooks/useError';
import { UserContext } from '@/pages/_app';
import { UserName } from './global/UserName';
import { upvote as TEXT } from '@/lib/text';

interface UpvoteIconProps {
  upvotes: ClientUpvote[];
  postId: string;
  children: ReactNode;
  col?: boolean;
  onSuccess: () => void;
}

export const Upvote = (props: UpvoteIconProps) => {
  const { upvotes, postId, col, children, onSuccess } = props;
  const { address } = useAccount();
  const { isValid } = useContext(UserContext) as UserContextType;
  const { errorMsg, setError, clearError, isError } = useError();

  const { signTypedDataAsync } = useSignTypedData();
  const getHasUpvoted = () => {
    if (!address) return false;
    return upvotes.some((v) => v.address === address.toLowerCase());
  };
  const hasUpvoted = useMemo(getHasUpvoted, [address, upvotes]);

  const [showVoteWarning, setShowVoteWarning] = useState(false);
  const [showWalletWarning, setShowWalletWarning] = useState(false);
  const [loadingUpvote, setLoadingUpvote] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const upvoteHandler = async () => {
    try {
      clearError();
      setLoadingUpvote(true);
      await submitUpvote(postId, signTypedDataAsync);
      setLoadingUpvote(false);
      onSuccess();
      setShowVoteWarning(false);
    } catch (error) {
      setError(error);
      setLoadingUpvote(false);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    if (!address || !isValid) {
      setShowWalletWarning(true);
      return;
    }
    if (hasUpvoted) return;
    setShowVoteWarning(true);
  };

  const handleModalClose = (handler: (val: boolean) => void) => {
    handler(false);
    if (buttonRef.current) buttonRef.current.focus();
  };
  return (
    <>
      {errorMsg && isError ? (
        <Modal width="50%" handleClose={clearError}>
          <RetryError message={TEXT.fetchError} error={errorMsg} refetchHandler={upvoteHandler} />
        </Modal>
      ) : showVoteWarning ? (
        <UpvoteWarning
          handleClose={() => handleModalClose(setShowVoteWarning)}
          upvoteHandler={upvoteHandler}
          loadingUpvote={loadingUpvote}
        />
      ) : showWalletWarning ? (
        <WalletWarning
          handleClose={() => handleModalClose(setShowWalletWarning)}
          action={TEXT.action}
        />
      ) : null}
      <button
        ref={buttonRef}
        onClick={handleClick}
        className={`flex ${
          col ? 'flex-col' : 'flex-row'
        } gap-1 justify-center items-center cursor-pointer h-min`}
      >
        <div className="hoverIcon">
          <FontAwesomeIcon icon={faCircleUp} color={hasUpvoted ? '#0e76fd' : ''} />
        </div>
        <div
          className="relative"
          onPointerEnter={() => setShowUsers(true)}
          onPointerLeave={() => setShowUsers(false)}
        >
          <div className="hover:font-bold">{children}</div>
          {showUsers && upvotes.length > 0 && (
            <div className="absolute top-full mt-2 w-max max-w-[150px] bg-gray-800 rounded-xl p-2 flex z-50">
              <div className="min-w-0 shrink">
                {upvotes.map((u) => {
                  return (
                    <p key={u.id} className="w-full text-white breakText">
                      <UserName userId={u.address} />
                    </p>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </button>
    </>
  );
};
