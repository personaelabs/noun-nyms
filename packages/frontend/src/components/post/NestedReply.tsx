import { useState } from 'react';
import { IPostWithReplies } from '@/types/api';
import { ReplyCount } from './ReplyCount';
import { UserTag } from './UserTag';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faReply } from '@fortawesome/free-solid-svg-icons';
import { Upvote } from '../Upvote';
import { PrefixedHex } from '@personaelabs/nymjs';
import { PostWriter } from '../userInput/PostWriter';
import { SingleReply } from './SingleReply';

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
  const { id, body, userId, timestamp, upvotes, depth, innerReplies, childrenLength, onSuccess } =
    replyProps;

  const postInfo = { id, body, userId, timestamp, upvotes };
  const [showPostWriter, setShowPostWriter] = useState<boolean>(false);

  return (
    // TODO: fix border here
    <div
      className="flex flex-col gap-2 pl-2 border-l border-dotted border-gray-300"
      key={id}
      style={{ marginLeft: `${depth * 20}px` }}
    >
      <SingleReply
        {...postInfo}
        replyCount={childrenLength}
        onSuccess={onSuccess}
        handleReply={() => setShowPostWriter(true)}
      />
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
