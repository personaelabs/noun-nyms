import { useContext, useRef, useState } from 'react';
import { IPostWithReplies } from '@/types/api';
import { PrefixedHex } from '@personaelabs/nymjs';
import { PostWriter } from '../userInput/PostWriter';
import { SingleReply } from './SingleReply';
import { DiscardPostWarning } from '../DiscardPostWarning';
import { UserContext } from '@/pages/_app';
import { UserContextType } from '@/types/components';
import axios from 'axios';
import { scrollToPost } from '@/lib/client-utils';
import { on } from 'events';

interface IReplyProps extends IPostWithReplies {
  depth: number;
  innerReplies: React.ReactNode[];
  childrenLength: number;
  onSuccess: (id?: string) => Promise<void>;
  showReplyWriter: boolean;
}
export const resolveNestedReplyThreads = (
  postsWithReplies: IPostWithReplies[] | undefined,
  depth: number,
  onSuccess: (id?: string) => Promise<void>,
  writerToShow?: string,
) => {
  const replyNodes: React.ReactNode[] = [];
  if (postsWithReplies && postsWithReplies.length > 0) {
    for (const post of postsWithReplies) {
      replyNodes.push(
        <NestedReply
          {...post}
          key={post.id}
          showReplyWriter={writerToShow === post.id}
          depth={depth}
          innerReplies={resolveNestedReplyThreads(post.replies, depth + 1, onSuccess)}
          childrenLength={post._count.replies ? post._count.replies : 0}
          onSuccess={onSuccess}
        />,
      );
    }
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
  const { postInProg } = useContext(UserContext) as UserContextType;
  const divRef = useRef<HTMLDivElement>(null);
  const [discardWarningOpen, setDiscardWarningOpen] = useState(false);
  const [replies, setReplies] = useState(innerReplies);

  const handleCloseWriterAttempt = () => {
    if (postInProg && showPostWriter) {
      setDiscardWarningOpen(true);
    } else setShowPostWriter(!showPostWriter);
  };

  const fetchChildren = async (id: string) => {
    try {
      const res = await axios.get<IPostWithReplies>(`/api/v1/posts/${id}?fromRoot=false
    `);
      console.log(res);
      const post = res.data;
      const replyComponents = resolveNestedReplyThreads(post.replies, post.depth, onSuccess);
      setReplies(replyComponents);
    } catch (error) {
      // TODO: Error handling?
    }
  };

  return (
    <>
      {discardWarningOpen && (
        <DiscardPostWarning
          handleClosePost={() => {
            setShowPostWriter(false);
            setDiscardWarningOpen(false);
          }}
          handleCloseWarning={() => setDiscardWarningOpen(false)}
        />
      )}
      <div
        ref={divRef}
        id={id}
        className="flex flex-col gap-2 transition-all ml-2"
        style={{ width: 'calc(100% - 8px)' }}
      >
        <SingleReply
          {...postInfo}
          replyCount={childrenLength}
          onSuccess={onSuccess}
          replyOpen={showPostWriter}
          handleReply={handleCloseWriterAttempt}
        >
          {showPostWriter ? (
            <PostWriter
              parentId={id as PrefixedHex}
              scrollToPost={onSuccess}
              handleCloseWriter={handleCloseWriterAttempt}
            />
          ) : null}
          <button onClick={() => fetchChildren(id)}>
            {childrenLength > replies.length && <p className="text-left">Show more replies </p>}
          </button>
          {replies}
        </SingleReply>
      </div>
    </>
  );
};
