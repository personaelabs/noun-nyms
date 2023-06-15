import { useContext, useRef, useState } from 'react';
import { IPostWithReplies } from '@/types/api';
import { PrefixedHex } from '@personaelabs/nymjs';
import { PostWriter } from '../userInput/PostWriter';
import { SingleReply } from './SingleReply';
import { DiscardPostWarning } from '../DiscardPostWarning';
import { UserContext } from '@/pages/_app';
import { UserContextType } from '@/types/components';
import axios from 'axios';
import useError from '@/hooks/useError';
import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { scrollToPost } from '@/lib/client-utils';
import { nestedReply as TEXT } from '@/lib/text';

interface IReplyProps {
  post: IPostWithReplies;
  depth: number;
  innerReplies: React.ReactNode[];
  childrenLength: number;
  showReplyWriter: boolean;
  highlight: boolean;
}
export const resolveNestedReplyThreads = (
  postsWithReplies: IPostWithReplies[] | undefined,
  depth: number,
  postToHighlight?: string,
  writerToShow?: string,
) => {
  const replyNodes: React.ReactNode[] = [];
  if (postsWithReplies && postsWithReplies.length > 0) {
    for (const post of postsWithReplies) {
      replyNodes.push(
        <NestedReply
          post={post}
          key={post.id}
          showReplyWriter={writerToShow === post.id}
          highlight={postToHighlight === post.id}
          depth={depth}
          innerReplies={resolveNestedReplyThreads(post.replies, depth + 1, postToHighlight)}
          childrenLength={post._count.replies ? post._count.replies : 0}
        />,
      );
    }
  }

  return replyNodes;
};

export const NestedReply = (replyProps: IReplyProps) => {
  const { post, innerReplies, childrenLength, showReplyWriter, highlight } = replyProps;
  const [showPostWriter, setShowPostWriter] = useState(showReplyWriter);
  const { isMobile, postInProg } = useContext(UserContext) as UserContextType;
  const { errorMsg, setError } = useError();

  // Post data
  const [replies, setReplies] = useState(innerReplies);
  const [localPost, setLocalPost] = useState(post);
  const [loadingLocalFetch, setLoadingLocalFetch] = useState(false);

  const divRef = useRef<HTMLDivElement>(null);
  const [discardWarningOpen, setDiscardWarningOpen] = useState(false);

  const handleCloseWriterAttempt = () => {
    if (postInProg && showPostWriter) {
      setDiscardWarningOpen(true);
    } else setShowPostWriter(!showPostWriter);
  };

  const refreshPost = async (id: string, postOnly = false) => {
    try {
      setError('');
      setLoadingLocalFetch(true);
      const res = await axios.get<IPostWithReplies>(`/api/v1/posts/${id}
    `);
      const post = res.data;
      if (postOnly) {
        setLocalPost(post);
      } else {
        const replyComponents = resolveNestedReplyThreads(post.replies, post.depth);
        setLocalPost(post);
        setReplies(replyComponents);
      }
    } catch (error) {
      setError(error);
    } finally {
      setLoadingLocalFetch(false);
    }
  };

  const refetchAndScrollToPost = async (postId: string) => {
    await refreshPost(postId);
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
        id={localPost.id}
        // extra 8px (.5rem) of margin on non-mobile screens
        className="flex flex-col gap-2 transition-all ml-0 md:ml-2 w-full"
        style={{ width: `calc(100% - ${isMobile ? 0 : 0.5}rem)` }}
      >
        <SingleReply
          post={localPost}
          highlight={highlight}
          replyCount={childrenLength}
          onUpvote={() => refreshPost(localPost.id, true)}
          replyOpen={showPostWriter}
          handleReply={handleCloseWriterAttempt}
        >
          {showPostWriter ? (
            <PostWriter
              parentId={localPost.id as PrefixedHex}
              scrollToPost={() => refetchAndScrollToPost(localPost.id)}
              handleCloseWriter={handleCloseWriterAttempt}
            />
          ) : null}
          {childrenLength > replies.length && (
            <button className="flex cursor-pointer" onClick={() => refreshPost(localPost.id)}>
              {errorMsg ? (
                <p className="error">
                  {errorMsg + ' '}
                  <span>
                    <FontAwesomeIcon icon={faRefresh} />
                  </span>
                </p>
              ) : (
                <p className="hover:underline font-semibold text-xs ">
                  {loadingLocalFetch ? TEXT.showingMoreReplies : TEXT.showMoreReplies}
                </p>
              )}
            </button>
          )}
          {replies}
        </SingleReply>
      </div>
    </>
  );
};
