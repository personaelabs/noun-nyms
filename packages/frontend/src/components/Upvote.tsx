import { faAngleUp, faSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAccount, useSignTypedData } from 'wagmi';
import { submitUpvote } from './example/Upvote';
import { useState } from 'react';
import { UpvoteWarning } from './UpvoteWarning';
import { ClientUpvote } from '@/types/components';

interface UpvoteIconProps {
  upvotes: ClientUpvote[];
  postId: string;
}

export const Upvote = (props: UpvoteIconProps) => {
  const { address } = useAccount();
  const { upvotes, postId } = props;
  const { signTypedDataAsync } = useSignTypedData();

  const getHasUpvoted = (address: string | undefined) => {
    if (!address) return false;
    return upvotes.some((v) => v.address === address.toLowerCase());
  };

  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [hasUpvoted, setHasUpvoted] = useState<boolean>(() => getHasUpvoted(address));

  const upvoteHandler = async () => {
    await submitUpvote(postId, signTypedDataAsync);
    setHasUpvoted(true);
    setShowWarning(false);
  };

  return (
    <>
      {showWarning ? (
        <UpvoteWarning
          isOpen={showWarning}
          handleClose={() => setShowWarning(false)}
          upvoteHandler={upvoteHandler}
        />
      ) : null}
      <div
        onClick={() => setShowWarning(true)}
        className="flex gap-1 justify-center items-center cursor-pointer"
      >
        <span className="fa-layers fa-fw hoverIcon">
          <FontAwesomeIcon icon={faSquare} color={hasUpvoted ? '#0e76fd' : ''} />
          <FontAwesomeIcon icon={faAngleUp} color="#ffffff" transform="shrink-4" />
        </span>
        <p>{upvotes.length}</p>
      </div>
    </>
  );
};
