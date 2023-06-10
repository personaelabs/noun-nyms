import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Upvote } from '../Upvote';
import { ReplyCount } from './ReplyCount';
import { UserTag } from './UserTag';
import { faReply } from '@fortawesome/free-solid-svg-icons';
import { CopyLink } from './CopyLink';
import { IPostPreview, IPostWithReplies } from '@/types/api';

interface SingleReplyProps {
  post: IPostWithReplies | IPostPreview;
  replyCount: number;
  onUpvote: () => void;
  handleReply: (id: string) => void;
  replyOpen: boolean;
  children?: React.ReactNode;
}

export const SingleReply = (props: SingleReplyProps) => {
  const { post, replyCount, onUpvote, handleReply, children, replyOpen } = props;
  const { id, userId, timestamp, body, upvotes } = post;

  return (
    <div className="flex flex-col gap-2">
      <UserTag userId={userId} timestamp={timestamp} />
      <div className="flex flex-col gap-2 ml-3 pl-2 border-l border-dotted border-gray-300">
        <span>{body}</span>
        <div className="flex flex-wrap justify-between items-center py-2 border-t border-gray-300">
          <Upvote upvotes={upvotes} postId={id} onSuccess={onUpvote}>
            <p>{upvotes?.length}</p>
          </Upvote>
          <div className="flex flex-wrap gap-4 justify-center items-center">
            <ReplyCount count={replyCount} />
            <div
              className="flex gap-2 items-center cursor-pointer hoverIcon"
              onClick={(e) => {
                e.stopPropagation();
                handleReply(id);
              }}
            >
              <FontAwesomeIcon icon={faReply} color={replyOpen ? '#0E76FD' : ''} />
              <p className="secondary" style={{ fontWeight: replyOpen ? 'bold' : 'normal' }}>
                Reply
              </p>
            </div>
            <CopyLink id={id} />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};
