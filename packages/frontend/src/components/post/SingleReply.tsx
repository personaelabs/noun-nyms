import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Upvote } from '../Upvote';
import { ReplyCount } from './ReplyCount';
import { UserTag } from './UserTag';
import { faReply } from '@fortawesome/free-solid-svg-icons';
import { CopyLink } from './CopyLink';
import { IPostPreview, IPostWithReplies } from '@/types/api';
import { useContext } from 'react';
import { UserContext } from '@/pages/_app';
import { UserContextType } from '@/types/components';
import { replyText as TEXT } from '@/lib/text';

interface SingleReplyProps {
  post: IPostWithReplies | IPostPreview;
  replyCount: number;
  highlight: boolean;
  onUpvote: () => void;
  handleReply: (id: string) => void;
  replyOpen: boolean;
  children?: React.ReactNode;
}

export const SingleReply = (props: SingleReplyProps) => {
  const { post, replyCount, highlight, onUpvote, handleReply, children, replyOpen } = props;
  const { id, userId, timestamp, body, upvotes } = post;
  const { isMobile } = useContext(UserContext) as UserContextType;

  return (
    <div className="flex flex-col gap-2">
      <div className={`${highlight ? 'z-20' : 'z-auto'}`}>
        <UserTag userId={userId} timestamp={timestamp} />
      </div>
      {/* extra 8px (.5rem) of margin on non-mobile screens */}
      <div className="relative flex flex-col gap-2 ml-2 md:ml-4 pl-2">
        <div className="absolute top-0 left-0 h-full w-[1px] p-2 border-l border-dotted border-gray-300 hover:border-gray-500" />
        <div className="relative z-10">
          <span>{body}</span>
          <div className="flex flex-wrap justify-between items-center py-2 border-t border-gray-300 z-30">
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
                  {TEXT.reply}
                </p>
              </div>
              <CopyLink id={id} />
            </div>
          </div>
          {highlight && (
            <div
              className="absolute bg-gray-100 -top-[3rem] md:-left-[1.5rem] -left-[1.25rem] rounded-xl -z-10"
              style={{
                width: `calc(100% + ${isMobile ? 1.75 : 2}rem)`,
                height: 'calc(100% + 3rem)',
              }}
            />
          )}
        </div>
        {children}
      </div>
    </div>
  );
};
