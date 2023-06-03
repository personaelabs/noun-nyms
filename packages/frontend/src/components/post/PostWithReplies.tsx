import { useEffect, useMemo } from 'react';
import { PostWriter } from '../userInput/PostWriter';
import { resolveNestedReplyThreads } from './NestedReply';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { IPostWithReplies } from '@/types/api';
import { PostWithRepliesProps } from '@/types/components';
import { ReplyCount } from './ReplyCount';
import { UserTag } from './UserTag';
import { Upvote } from '../Upvote';
import { PrefixedHex } from '@personaelabs/nymjs';
import Spinner from '../global/Spinner';
import { RetryError } from '../global/RetryError';
import useError from '@/hooks/useError';

const getPostById = async (postId: string, fromRoot = false) =>
  (await axios.get<IPostWithReplies>(`/api/v1/posts/${postId}?fromRoot=${fromRoot}`)).data;

export const PostWithReplies = (postWithRepliesProps: PostWithRepliesProps) => {
  const { writerToShow, postId } = postWithRepliesProps;
  const fromRoot = true;
  const { errorMsg, setError } = useError();

  const {
    isLoading,
    isError,
    refetch,
    data: singlePost,
  } = useQuery<IPostWithReplies>({
    queryKey: ['post', postId, fromRoot],
    queryFn: () => getPostById(postId, fromRoot),
    retry: 1,
    enabled: true,
    staleTime: 5000,
    refetchIntervalInBackground: true,
    refetchInterval: 30000, // 30 seconds
    onError: (error) => {
      setError(error);
    },
  });

  const nestedComponentThreads = useMemo(() => {
    if (singlePost) {
      return resolveNestedReplyThreads(singlePost.replies, 0, refetch, writerToShow);
    } else {
      return <div></div>;
    }
  }, [singlePost, refetch, writerToShow]);

  const refetchAndScrollToPost = async (postId?: string) => {
    await refetch();
    if (postId) {
      //wait for DOM to update
      setTimeout(() => {
        document.getElementById(postId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  };

  useEffect(() => {
    //if post is not the root, scroll to post
    if (singlePost && singlePost.id !== postId) {
      setTimeout(
        () =>
          document.getElementById(postId)?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        500,
      );
    }
  }, [postId, singlePost]);

  return (
    <>
      {singlePost ? (
        <>
          <div className="flex flex-col gap-4 py-8 px-8 md:px-12 md:py-10">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between item-center">
                <div className="self-start line-clamp-2">
                  <h3 className="tracking-tight">{singlePost.title}</h3>
                </div>
              </div>
              <p>{singlePost.body}</p>
            </div>
            <div className="flex gap-2 flex-wrap justify-between pt-2 border-t border-dotted border-gray-300 items-center">
              <UserTag userId={singlePost.userId} timestamp={singlePost.timestamp} />
              <div className="flex gap-2">
                <ReplyCount count={singlePost.replies.length} />
                <div className="border-l border-dotted border-gray-200 pl-2">
                  <Upvote upvotes={singlePost.upvotes} postId={singlePost.id} onSuccess={refetch}>
                    <p>{singlePost.upvotes.length}</p>
                  </Upvote>
                </div>
              </div>
            </div>
          </div>
          <div className="flex grow flex-col gap-8 w-full bg-gray-50 px-8 py-8">
            <PostWriter
              parentId={singlePost.id as PrefixedHex}
              onSuccess={refetchAndScrollToPost}
            />
            <>
              <h4>
                {singlePost.replies.length} {singlePost.replies.length === 1 ? 'reply' : 'replies'}
              </h4>
              <div className="flex flex-col gap-6 w-full justify-center items-center">
                {nestedComponentThreads}
              </div>
            </>
          </div>
        </>
      ) : (
        <div className="h-screen flex flex-col justify-center">
          {isLoading ? (
            <Spinner />
          ) : isError ? (
            <RetryError message="Could not fetch post:" error={errorMsg} refetchHandler={refetch} />
          ) : null}
        </div>
      )}
    </>
  );
};
