import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Upvote } from '../Upvote';
import { ReplyCount } from './ReplyCount';
import { UserTag } from './UserTag';
import { ClientUpvote } from '@/types/components';
import { faReply } from '@fortawesome/free-solid-svg-icons';

interface SingleReplyProps {
  id: string;
  userId: string;
  timestamp: Date;
  body: string;
  replyCount: number;
  upvotes: ClientUpvote[];
  onSuccess: () => void;
  handleReply: (id: string) => void;
  replyOpen: boolean;
  children?: React.ReactNode;
}

export const SingleReply = (props: SingleReplyProps) => {
  const {
    id,
    userId,
    timestamp,
    body,
    upvotes,
    replyCount,
    onSuccess,
    handleReply,
    children,
    replyOpen,
  } = props;

  return (
    <div className="w-full flex flex-col gap-2">
      <UserTag userId={userId} timestamp={timestamp} />
      <div className="flex flex-col gap-2 ml-3 pl-2 border-l border-dotted border-gray-200">
        <span>{body}</span>
        <div className="flex justify-between items-center py-2 border-t border-gray-200">
          <Upvote upvotes={upvotes} postId={id} onSuccess={onSuccess}>
            <p>{upvotes.length}</p>
          </Upvote>
          <div className="flex gap-4 justify-center items-center">
            <ReplyCount count={replyCount} />
            <div
              className="flex gap-2 items-center cursor-pointer hoverIcon"
              onClick={(e) => {
                e.stopPropagation();
                handleReply(id);
              }}
            >
              <FontAwesomeIcon icon={faReply} color={replyOpen ? '#0E76FD' : ''} />
              <p
                className="text-gray-700 hover:underline"
                style={{ fontWeight: replyOpen ? 'bold' : 'normal' }}
              >
                Reply
              </p>
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};
