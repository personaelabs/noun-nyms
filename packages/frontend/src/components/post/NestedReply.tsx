import { useState } from 'react';
import { IPostWithReplies } from '@/types/api';
import { ReplyCount } from './ReplyCount';
import { UserTag } from './UserTag';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faReply } from '@fortawesome/free-solid-svg-icons';
import { Upvote } from '../Upvote';
import { PrefixedHex } from '@personaelabs/nymjs';
import { PostWriter } from '../userInput/PostWriter';

interface IReplyProps extends IPostWithReplies {
  depth: number;
  innerReplies: React.ReactNode;
  proof: string;
  childrenLength: number;
  onSuccess: () => void;
}
export const resolveNestedReplyThreads = (
  allPosts: IPostWithReplies[],
  depth: number,
  onSuccess: () => void,
) => {
  const replyNodes: React.ReactNode[] = [];
  const proof = '';
  for (const post of allPosts) {
    replyNodes.push(
      <NestedReply
        {...post}
        key={post.id}
        depth={depth}
        innerReplies={resolveNestedReplyThreads(post.replies, depth + 1, onSuccess)}
        proof={proof}
        childrenLength={post.replies.length}
        onSuccess={onSuccess}
      />,
    );
  }
  return replyNodes;
};

export const NestedReply = (replyProps: IReplyProps) => {
  const { depth, id, body, userId, timestamp, innerReplies, childrenLength, upvotes, onSuccess } =
    replyProps;

  const [showPostWriter, setShowPostWriter] = useState<boolean>(false);

  return (
    // TODO: fix border here
    <div
      className="flex flex-col gap-2 pl-2 border-l border-dotted border-gray-300"
      key={id}
      style={{ marginLeft: `${depth * 20}px` }}
    >
      <UserTag userId={userId} timestamp={timestamp} />
      <span>{body}</span>
      <div className="flex justify-between items-center py-2 border-t border-gray-300">
        <Upvote upvotes={upvotes} postId={id} onSuccess={onSuccess}>
          <p>{upvotes.length}</p>
        </Upvote>
        <div className="flex gap-4 justify-center items-center">
          <ReplyCount count={childrenLength} />
          <div
            className="flex gap-2 items-center cursor-pointer hoverIcon"
            onClick={() => setShowPostWriter(!showPostWriter)}
          >
            <FontAwesomeIcon icon={faReply} color={showPostWriter ? '#0E76FD' : ''} />
            <p className={`text-gray-700 ${showPostWriter ? 'font-bold' : ''}`}>Reply</p>
          </div>
        </div>
      </div>
      {showPostWriter ? (
        <PostWriter
          parentId={id as PrefixedHex}
          onSuccess={onSuccess}
          handleCloseWriter={() => setShowPostWriter(false)}
        />
      ) : null}
      {innerReplies}
    </div>
  );
};
