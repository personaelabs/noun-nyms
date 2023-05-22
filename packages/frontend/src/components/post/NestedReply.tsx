import { useState } from 'react';
import { IPostWithReplies } from '@/types/api';
import { PrefixedHex } from '@personaelabs/nymjs';
import { PostWriter } from '../userInput/PostWriter';
import { SingleReply } from './SingleReply';

interface IReplyProps extends IPostWithReplies {
  depth: number;
  innerReplies: React.ReactNode[];
  proof: string;
  childrenLength: number;
  onSuccess: () => void;
  showReplyWriter: boolean;
}
export const resolveNestedReplyThreads = (
  allPosts: IPostWithReplies[],
  depth: number,
  onSuccess: () => void,
  writerToShow?: string,
) => {
  const replyNodes: React.ReactNode[] = [];
  const proof = '';
  for (const post of allPosts) {
    replyNodes.push(
      <NestedReply
        {...post}
        key={post.id}
        showReplyWriter={writerToShow === post.id}
        depth={depth}
        innerReplies={resolveNestedReplyThreads(post.replies, depth + 1, onSuccess, writerToShow)}
        proof={proof}
        childrenLength={post.replies.length}
        onSuccess={onSuccess}
      />,
    );
  }
  return replyNodes;
};

export const NestedReply = (replyProps: IReplyProps) => {
  const {
    id,
    body,
    userId,
    timestamp,
    upvotes,
    depth,
    innerReplies,
    childrenLength,
    onSuccess,
    showReplyWriter,
  } = replyProps;

  const postInfo = { id, body, userId, timestamp, upvotes };
  const [showPostWriter, setShowPostWriter] = useState<boolean>(showReplyWriter);

  return (
    <div className="w-full flex flex-col gap-2" key={id} style={{ marginLeft: `${depth * 10}px` }}>
      <SingleReply
        {...postInfo}
        replyCount={childrenLength}
        onSuccess={onSuccess}
        handleReply={() => setShowPostWriter(!showPostWriter)}
      >
        {showPostWriter ? (
          <PostWriter
            parentId={id as PrefixedHex}
            onSuccess={onSuccess}
            handleCloseWriter={() => setShowPostWriter(false)}
          />
        ) : null}
        {innerReplies}
      </SingleReply>
    </div>
  );
};
