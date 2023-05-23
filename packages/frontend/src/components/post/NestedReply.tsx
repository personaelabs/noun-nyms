import { useEffect, useRef, useState } from 'react';
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
    console.log(`nest`, post.id);
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
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (divRef.current && showReplyWriter) {
      console.log('scrolling into view');
      divRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showReplyWriter]);

  return (
    <div
      ref={divRef}
      id={id}
      className="flex flex-col gap-2"
      style={{ marginLeft: `${depth * 10}px`, width: `calc(100% - ${depth * 10}px)` }}
    >
      <SingleReply
        {...postInfo}
        replyCount={childrenLength}
        onSuccess={onSuccess}
        replyOpen={showPostWriter}
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
