import { faAngleUp, faSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSignTypedData } from 'wagmi';
import { submitUpvote } from './example/Upvote';

interface UpvoteIconProps {
  count: number;
  postId: string;
}

export const UpvoteIcon = (props: UpvoteIconProps) => {
  const { count, postId } = props;
  const { signTypedDataAsync } = useSignTypedData();

  const upvoteHandler = () => {
    submitUpvote(postId, signTypedDataAsync);
  };

  return (
    <div onClick={upvoteHandler} className="flex gap-1 justify-center items-center cursor-pointer">
      <span className="fa-layers fa-fw hoverIcon">
        <FontAwesomeIcon icon={faSquare} />
        <FontAwesomeIcon icon={faAngleUp} color="#ffffff" transform="shrink-4" />
      </span>
      <p>{count}</p>
    </div>
  );
};
