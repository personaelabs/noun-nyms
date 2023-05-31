import { Dispatch, MutableRefObject, SetStateAction, useEffect, useRef, useState } from 'react';
import { IPostWithReplies } from '@/types/api';
import { PrefixedHex } from '@personaelabs/nymjs';
import { PostWriter } from '../userInput/PostWriter';
import { SingleReply } from './SingleReply';

interface IReplyProps extends IPostWithReplies {
  depth: number;
  innerReplies: React.ReactNode[] | React.ReactNode;
  proof: string;
  childrenLength: number;
  onSuccess: () => void;
  showReplyWriter: boolean;
}
export const resolveNestedReplyThreads = (
  allPosts: IPostWithReplies[],
  depth: number,
  postsVisibilityMap: Record<string, number> | undefined,
  setPostsVisibility: Dispatch<SetStateAction<Record<string, number> | undefined>>,
  onSuccess: () => void,
  trail: string[],
  additionalDataKeys: string[][],
  setAdditionalDataKeys: Dispatch<SetStateAction<string[][]>>,
  shouldRerenderThreads: MutableRefObject<boolean>,
  writerToShow?: string,
) => {
  const replyNodes: React.ReactNode[] = [];

  if (
    !postsVisibilityMap ||
    !allPosts ||
    (allPosts.length > 0 && !postsVisibilityMap[allPosts[0].id])
  ) {
    return (
      <div>
        <button
          onClick={() => {
            if (!allPosts) {
              // this means we've hit the max depth of comments already loaded on the client
              // and we may need to fetch deeper comments. we'll do this by adding the trail
              // to the additionalDataKeys array, which will trigger a rerender of the component
              const newKeys = [...additionalDataKeys];
              newKeys.push(trail);
              shouldRerenderThreads.current = true;
              setAdditionalDataKeys(newKeys);
            } else {
              // set posts at this depth to be visible
              const newPostsVisibility = { ...postsVisibilityMap };
              allPosts.forEach((post) => {
                newPostsVisibility[post.id] = 1;
              });
              setPostsVisibility(newPostsVisibility);
            }
          }}
        >
          {allPosts ? allPosts.length : 'View'} more {allPosts?.length === 1 ? 'reply' : 'replies'}
        </button>
      </div>
    );
  }

  for (const post of allPosts) {
    const newTrail = [...trail];
    newTrail.push(post.id);

    // TODO: fix
    const proof = '';

    replyNodes.push(
      <NestedReply
        {...post}
        key={post.id}
        showReplyWriter={writerToShow === post.id}
        depth={depth}
        innerReplies={resolveNestedReplyThreads(
          post.replies,
          depth + 1,
          postsVisibilityMap,
          setPostsVisibility,
          onSuccess,
          newTrail,
          additionalDataKeys,
          setAdditionalDataKeys,
          shouldRerenderThreads,
          writerToShow,
        )}
        proof={proof}
        childrenLength={post.replies ? post.replies.length : 0}
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
      setTimeout(() => divRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
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
