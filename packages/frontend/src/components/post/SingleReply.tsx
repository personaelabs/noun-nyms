import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Upvote } from '../Upvote';
import { ReplyCount } from './ReplyCount';
import { UserTag } from './UserTag';
import { ClientUpvote } from '@/types/components';
import { faReply } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

interface SingleReplyProps {
  id: string;
  userId: string;
  timestamp: Date;
  body: string;
  replyCount: number;
  upvotes: ClientUpvote[];
  onSuccess: () => void;
  handleReply: () => void;
}

export const SingleReply = (props: SingleReplyProps) => {
  const { id, userId, timestamp, body, upvotes, replyCount, onSuccess, handleReply } = props;

  const [replyToggled, setReplyToggled] = useState<boolean>(false);
  return (
    <>
      <UserTag userId={userId} timestamp={timestamp} />
      <span>{body}</span>
      <div className="flex justify-between items-center py-2 border-t border-gray-300">
        <Upvote upvotes={upvotes} postId={id} onSuccess={onSuccess}>
          <p>{upvotes.length}</p>
        </Upvote>
        <div className="flex gap-4 justify-center items-center">
          <ReplyCount count={replyCount} />
          <div
            className="flex gap-2 items-center cursor-pointer hoverIcon"
            onClick={() => {
              setReplyToggled(true);
              handleReply();
            }}
          >
            <FontAwesomeIcon icon={faReply} color={replyToggled ? '#0E76FD' : ''} />
            <p className={`text-gray-700 ${replyToggled ? 'font-bold' : ''}`}>Reply</p>
          </div>
        </div>
      </div>
    </>
  );
};
