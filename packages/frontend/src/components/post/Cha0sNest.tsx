import { useRef, useState } from 'react';
import { IPostWithReplies } from '@/types/api';
import { PrefixedHex } from '@personaelabs/nymjs';
import { PostWriter } from '../userInput/PostWriter';
import { SingleReply } from './SingleReply';
import { DiscardPostWarning } from '../DiscardPostWarning';
import axios from 'axios';
import { scrollToPost } from '@/lib/client-utils';

interface IReplyProps extends IPostWithReplies {
  depth: number;
  innerReplies: React.ReactNode[];
  childrenLength: number;
  onSuccess: () => void;
  showReplyWriter: boolean;
}
export const resolveNestedReplyThreads = (
  postsWithReplies: IPostWithReplies[] | undefined,
  depth: number,
  onSuccess: () => void,
  writerToShow?: string,
) => {
  const replyNodes: React.ReactNode[] = [];
  console.log(`Rendering ${postsWithReplies?.length} posts at depth ${depth}`);
  if (postsWithReplies && postsWithReplies.length > 0) {
    console.log(`here?`);
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
  const divRef = useRef<HTMLDivElement>(null);
  const [postInProg, setPostInProg] = useState('');
  const handleData = (data: string) => setPostInProg(data);
  const [discardWarningOpen, setDiscardWarningOpen] = useState(false);
  const [replies, setReplies] = useState(innerReplies);

  const handleCloseWriterAttempt = () => {
    if (postInProg && showPostWriter) {
      setDiscardWarningOpen(true);
    } else setShowPostWriter(!showPostWriter);
  };

  console.log(`has ${childrenLength} children but recevied `, innerReplies.length);

  const fetchChildren = async (id: string) => {
    try {
      const res = await axios.get<IPostWithReplies>(`/api/v1/posts/${id}?fromRoot=fals
    `);
      console.log(res);
      const post = res.data;
      const replyComponents = resolveNestedReplyThreads(post.replies, post.depth, () =>
        console.log(`success?`),
      );
      setReplies(replyComponents);
    } catch (error) {}
  };

  const refetchAndScrollToPost = async (postId?: string) => {
    await fetchChildren(id);
    const post = await scrollToPost(postId);
    setTimeout(() => {
      if (post) post.style.setProperty('opacity', '1');
    }, 1000);
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
        className="flex flex-col gap-2 transition-all"
        style={{ marginLeft: `${depth * 10}px`, width: `calc(100% - ${depth * 10}px)` }}
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
              onSuccess={() => refetchAndScrollToPost(id)}
              handleCloseWriter={handleCloseWriterAttempt}
              onProgress={handleData}
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
