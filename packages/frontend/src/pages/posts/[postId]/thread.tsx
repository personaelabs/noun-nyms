import useError from '@/hooks/useError';
import { IPostWithReplies } from '@/types/api';
import { PostWithRepliesProps } from '@/types/components';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { scrollToPost } from '@/lib/client-utils';
import { PrefixedHex } from '@personaelabs/nymjs';
import { PostWriter } from '@/components/userInput/PostWriter';
import { UserTag } from '@/components/post/UserTag';
import { ReplyCount } from '@/components/post/ReplyCount';
import { Upvote } from '@/components/Upvote';
import Spinner from '@/components/global/Spinner';
import { RetryError } from '@/components/global/RetryError';
import _ from 'lodash';
import { resolveNestedReplyThreads } from '@/components/post/Cha0sNest';
import { useRouter } from 'next/router';

const getPostById = async (postId: string, fromRoot = false) =>
  (await axios.get<IPostWithReplies>(`/api/v1/posts/${postId}?fromRoot=${fromRoot}`)).data;

const Thread = (postWithRepliesProps: PostWithRepliesProps) => {
  const router = useRouter();
  const postId = router.query.postId as string;

  const fromRoot = true;
  const { errorMsg, setError } = useError();

  const {
    isLoading,
    isSuccess,
    isError,
    refetch,
    data: singlePost,
  } = useQuery<IPostWithReplies>({
    queryKey: ['post', postId, fromRoot],
    queryFn: async () => {
      const posts = await getPostById(postId, fromRoot);
      return posts;
    },
    retry: 1,
    enabled: !!postId,
    staleTime: 5000,
    refetchIntervalInBackground: true,
    refetchInterval: 30000, // 30 seconds
    onError: (error) => {
      setError(error);
    },
  });

  console.log(`single post`, singlePost);

  const nestedComponentThreads = useMemo(() => {
    if (singlePost) {
      return resolveNestedReplyThreads(singlePost.replies, singlePost.depth, refetch);
    } else {
      return <div></div>;
    }
  }, [singlePost, refetch]);

  return (
    <>
      {singlePost ? (
        <>
          <div className="flex flex-col gap-4 py-6 px-6 md:px-12 md:py-10">
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
          <div className="flex grow flex-col gap-8 w-full bg-gray-50 p-6">
            <PostWriter
              parentId={singlePost.id as PrefixedHex}
              onSuccess={() => console.log(`refetch and scroll`)}
              onProgress={() => console.log(`progress`)}
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

export default Thread;
