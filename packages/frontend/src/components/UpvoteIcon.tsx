import { faAngleUp, faSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAccount, useSignTypedData } from 'wagmi';
import { submitUpvote } from './example/Upvote';
import { useState } from 'react';
import { Modal } from './global/Modal';
import Image from 'next/image';
import { MainButton } from './MainButton';
import { UpvoteWarning } from './UpvoteWarning';

interface UpvoteIconProps {
  count: number;
  postId: string;
}

export const UpvoteIcon = (props: UpvoteIconProps) => {
  const { address } = useAccount();
  const { count, postId } = props;
  const { signTypedDataAsync } = useSignTypedData();
  const [showWarning, setShowWarning] = useState<boolean>(false);

  const upvoteHandler = async () => {
    await submitUpvote(postId, signTypedDataAsync);
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
          <FontAwesomeIcon icon={faSquare} />
          <FontAwesomeIcon icon={faAngleUp} color="#ffffff" transform="shrink-4" />
        </span>
        <p>{count}</p>
      </div>
    </>
  );
};
