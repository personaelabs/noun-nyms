import { faAngleUp, faSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAccount, useSignTypedData } from 'wagmi';
import { submitUpvote } from '@/lib/actions';
import { useMemo, useState } from 'react';
import { UpvoteWarning } from './UpvoteWarning';
import { ClientUpvote } from '@/types/components';
import { ReactNode } from 'react';
import { WalletWarning } from './WalletWarning';

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
  const hasUpvoted = useMemo(getHasUpvoted, [address, upvotes]);

  const upvoteHandler = async () => {
    await submitUpvote(postId, signTypedDataAsync);
    onSuccess();
    setShowVoteWarning(false);
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
      {showVoteWarning ? (
        <UpvoteWarning
          handleClose={() => setShowVoteWarning(false)}
          upvoteHandler={upvoteHandler}
        />
      ) : showWalletWarning ? (
        <WalletWarning handleClose={() => setShowWalletWarning(false)} action="upvote" />
      ) : null}
      <div
        onClick={handleClick}
        className={`flex ${
          col ? 'flex-col' : 'flex-row'
        } gap-1 justify-center items-center cursor-pointer`}
      >
        <span className="fa-layers fa-fw hoverIcon">
          <FontAwesomeIcon icon={faSquare} color={hasUpvoted ? '#0e76fd' : ''} />
          <FontAwesomeIcon icon={faAngleUp} color="#ffffff" transform="shrink-4" />
        </span>
        {children}
      </div>
    </>
  );
};
