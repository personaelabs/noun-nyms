import { faMessage } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const ReplyCount = (replyCountProps: { count: number }) => {
  const { count } = replyCountProps;

  return (
    <div className="flex gap-1 justify-center items-center">
      <FontAwesomeIcon icon={faMessage} color={'#d0d5dd'} />
      <p className="postDetail">{count}</p>
    </div>
  );
};
