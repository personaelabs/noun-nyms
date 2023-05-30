import { useMemo, useRef, useState, useEffect } from 'react';
import { PostWriter } from '../userInput/PostWriter';
import { resolveNestedReplyThreads } from './NestedReply';
import { useQueries, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { IPostWithReplies } from '@/types/api';
import { PostWithRepliesProps } from '@/types/components';
import { ReplyCount } from './ReplyCount';
import { UserTag } from './UserTag';
import { Upvote } from '../Upvote';
import { PrefixedHex } from '@personaelabs/nymjs';
import { Modal } from '../global/Modal';
import Spinner from '../global/Spinner';
import { RetryError } from '../global/RetryError';
import useError from '@/hooks/useError';
import _ from 'lodash';

const getPostById = async (postId: string, fromRoot = false) =>
  (await axios.get<IPostWithReplies>(`/api/v1/posts/${postId}?fromRoot=${fromRoot}`)).data;

export const PostWithReplies = (postWithRepliesProps: PostWithRepliesProps) => {
  const [postsVisibilityMap, setPostsVisibilityMap] = useState<Record<string, number> | undefined>(
    undefined,
  );
  const [combinedData, setCombinedData] = useState<IPostWithReplies | undefined>(undefined);
  const shouldRerenderThreads = useRef(false);
  const { writerToShow, handleClose, postId } = postWithRepliesProps;
  const fromRoot = true;
  const { errorMsg, setError } = useError();

  //array of keys for additional data queries. each key is an array of strings corresponding to the path of the data from the root
  const [additionalDataKeys, setAdditionalDataKeys] = useState<string[][]>([]);

  const baseQueryKey = ['post', postId, fromRoot];
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
      // initialize every post with value 0
      const postsVisibilityData: Record<string, number> = {};
      postsVisibilityData[posts.id] = 0;
      // loop through all replies and initialize them with value 0
      posts.replies.forEach((reply) => {
        postsVisibilityData[reply.id] = 1;
      });
      setPostsVisibilityMap(postsVisibilityData);
      return posts;
    },
    retry: 1,
    enabled: true,
    staleTime: 5000,
    refetchIntervalInBackground: true,
    refetchInterval: 30000, // 30 seconds
    onError: (error) => {
      setError(error);
    },
  });

  const fetchAdditionalReplies = async (trail: string[]) => {
    const newReplies = await getPostById(trail[trail.length - 1]);
    return newReplies;
  };

  const additionalDataQueries = useQueries({
    queries: additionalDataKeys.map((key) => ({
      queryKey: [...baseQueryKey, ...key],
      queryFn: async () => fetchAdditionalReplies(key),
      staleTime: Infinity, // Ensures the additional data is not re-fetched separately
    })),
  });

  useEffect(() => {
    if (isSuccess) {
      setCombinedData(singlePost);
    }
  }, [isSuccess, singlePost]);

  useEffect(() => {
    const data = combinedData ? _.cloneDeep(combinedData) : _.cloneDeep(singlePost);
    // check every additionalDataQueries has been fetched
    if (
      additionalDataQueries.length > 0 &&
      shouldRerenderThreads.current &&
      additionalDataQueries.every((query) => {
        return query.isSuccess;
      })
    ) {
      const testing = additionalDataQueries.reduce((acc: any, query: any, index) => {
        const trail = additionalDataKeys[index];
        // navigate to the replies of singlePost
        let postToAddTo = acc;
        for (let i = 0; i < trail.length - 1; i++) {
          if (postToAddTo.replies) {
            postToAddTo = postToAddTo.replies.find(
              (reply: IPostWithReplies) => reply.id === trail[i + 1],
            );
          }
        }
        if (postToAddTo) {
          postToAddTo.replies = query.data.replies;
        }
        return acc;
      }, data);
      console.log('new: ', testing);
      setCombinedData(testing);
      shouldRerenderThreads.current = false;
    }
  }, [additionalDataKeys, additionalDataQueries, shouldRerenderThreads]);

  const nestedComponentThreads = useMemo(() => {
    if (singlePost) {
      return resolveNestedReplyThreads(
        combinedData ? combinedData.replies : [],
        0,
        postsVisibilityMap,
        setPostsVisibilityMap,
        refetch,
        [singlePost.id],
        additionalDataKeys,
        setAdditionalDataKeys,
        shouldRerenderThreads,
        writerToShow,
      );
    } else {
      return <div></div>;
    }
  }, [singlePost, combinedData, postsVisibilityMap, refetch, additionalDataKeys, writerToShow]);

  const refetchAndScrollToPost = async (postId?: string) => {
    await refetch();
    if (postId) {
      //wait for DOM to update
      setTimeout(() => {
        document.getElementById(postId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  };

  return (
    <Modal startAtTop={true} handleClose={handleClose}>
      {singlePost ? (
        <>
          <div className="flex flex-col gap-4 py-8 px-12 md:px-12 md:py-10">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between item-center">
                <div className="self-start line-clamp-2">
                  <h3 className="tracking-tight">{singlePost.title}</h3>
                </div>
              </div>
              <p>{singlePost.body}</p>
            </div>
            <div className="flex justify-between pt-2 border-t border-dotted border-gray-300 items-center">
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
          <div className="flex flex-col gap-8 w-full bg-gray-50 px-12 py-8">
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
        <div className="h-full flex flex-col justify-center">
          {isLoading ? (
            <Spinner />
          ) : isError ? (
            <RetryError message="Could not fetch post:" error={errorMsg} refetchHandler={refetch} />
          ) : null}
        </div>
      )}
    </Modal>
  );
};
