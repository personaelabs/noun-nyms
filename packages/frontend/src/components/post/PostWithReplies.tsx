import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
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
import Spinner from '../global/Spinner';
import { RetryError } from '../global/RetryError';
import useError from '@/hooks/useError';
import _ from 'lodash';
import { scrollToPost } from '@/lib/client-utils';

const getPostById = async (postId: string, fromRoot = false) =>
  (await axios.get<IPostWithReplies>(`/api/v1/posts/${postId}?fromRoot=${fromRoot}`)).data;

export const PostWithReplies = (postWithRepliesProps: PostWithRepliesProps) => {
  // map of post id to visibility status, to keep track of which comments on the client to display and hide
  const [postsVisibilityMap, setPostsVisibilityMap] = useState<Record<string, number>>({});
  // combinedData is the tree of all posts including the root post and all replies as well as any additional
  // deeper data that needed to be fetched and has been correctly added to the tree
  const [combinedData, setCombinedData] = useState<IPostWithReplies | undefined>(undefined);
  const shouldRerenderThreads = useRef(false);
  const { writerToShow, postId, onData } = postWithRepliesProps;
  const fromRoot = true;
  const { errorMsg, setError } = useError();
  const handleData = (data: string) => onData(data);

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

  const onPostSubmitSuccess = useCallback(
    async (id?: string) => {
      if (id) {
        const newPostsVisibility = { ...postsVisibilityMap };
        newPostsVisibility[id] = 1;
        setPostsVisibilityMap(newPostsVisibility);
      }
      await refetch();
    },
    [postsVisibilityMap, refetch],
  );

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

  // returns true if post was found or false if it was not found to query the api
  const recursivelyFindPostId = (
    idLookFor: string,
    path: string[],
    depth: number,
    data?: IPostWithReplies,
  ): boolean => {
    if (data) {
      const replies = data.replies;

      // don't mess with top-level comments which we have another useEffect for loading
      if (data.id === idLookFor && depth > 1) {
        const newPostsVisibility = { ...postsVisibilityMap };

        for (const element of path) {
          newPostsVisibility[element] = 1;
        }

        newPostsVisibility[idLookFor] = 1;
        setPostsVisibilityMap(newPostsVisibility);
      }

      if (data.replies) {
        for (let i = 0; i < replies.length; i++) {
          const reply = replies[i];
          const newPath = [...path, reply.id];
          return recursivelyFindPostId(idLookFor, newPath, depth + 1, reply);
        }
      } else {
        return false;
      }
    }
    return false;
  };

  // to make sure top-level comments always load when the component is mounted
  useEffect(() => {
    const newPostsVisibility = { ...postsVisibilityMap };
    if (combinedData) {
      newPostsVisibility[combinedData.id] = 1;
      combinedData.replies.forEach((reply) => {
        newPostsVisibility[reply.id] = 1;
      });
      console.log('set from combined data');
      setPostsVisibilityMap(newPostsVisibility);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combinedData]);

  useEffect(() => {
    const data = combinedData ? _.cloneDeep(combinedData) : _.cloneDeep(singlePost);
    // check every additionalDataQueries has been fetched successfully and that we haven't already rerendered the threads
    if (
      additionalDataQueries.length > 0 &&
      shouldRerenderThreads.current &&
      additionalDataQueries.every((query) => {
        return query.isSuccess;
      })
    ) {
      const newData = additionalDataQueries.reduce((acc: any, query: any, index) => {
        const trail = additionalDataKeys[index];
        // navigate to the replies of singlePost
        let postToAddTo = acc;

        // for each new additional data query, we need to add this data to the correct post in the combinedData
        // we navigate to the thread of the post we want to add to, and then add the replies to that post
        for (let i = 0; i < trail.length - 1; i++) {
          if (postToAddTo.replies) {
            postToAddTo = postToAddTo.replies.find(
              (reply: IPostWithReplies) => reply.id === trail[i + 1],
            );
          }
        }

        if (postToAddTo) {
          postToAddTo.replies = query.data.replies;

          // set the first level of replies to be visible
          const newPostsVisibility = { ...postsVisibilityMap };
          query.data.replies.forEach((post: any) => {
            newPostsVisibility[post.id] = 1;
          });
          setPostsVisibilityMap(newPostsVisibility);
        }
        return acc;
      }, data);

      setCombinedData(newData);
      shouldRerenderThreads.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [additionalDataKeys, additionalDataQueries, shouldRerenderThreads]);

  useEffect(() => {
    // if postId is defined in postWithRepliesProps, navigate postsVisibilityMap and set the post to be visible
    if (postWithRepliesProps.postId && combinedData) {
      const foundPostWithId = recursivelyFindPostId(
        postWithRepliesProps.postId,
        [combinedData?.id || ''],
        0,
        combinedData,
      );

      // if not found query the api at api/v1/posts/postId/fetchParents
      // if (!foundPostWithId) {
      //   console.log('combined: ', combinedData);
      //   console.log('querying post parents');
      //   const fetchPost = async () => {
      //     const newResult = await axios.get(
      //       '/api/v1/posts/' + postWithRepliesProps.postId + '/fetchParents',
      //     );
      //     setCombinedData(newResult.data);
      //   };
      //   fetchPost();
      // }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combinedData, postWithRepliesProps.postId]);

  const nestedComponentThreads = useMemo(() => {
    if (singlePost) {
      return resolveNestedReplyThreads(
        combinedData ? combinedData.replies : [],
        0,
        postsVisibilityMap,
        setPostsVisibilityMap,
        onPostSubmitSuccess,
        [singlePost.id],
        additionalDataKeys,
        setAdditionalDataKeys,
        shouldRerenderThreads,
        writerToShow,
      );
    } else {
      return <div></div>;
    }
  }, [
    singlePost,
    combinedData,
    postsVisibilityMap,
    setPostsVisibilityMap,
    onPostSubmitSuccess,
    additionalDataKeys,
    writerToShow,
  ]);

  const refetchAndScrollToPost = async (postId?: string) => {
    await refetch();
    const post = await scrollToPost(postId);
    setTimeout(() => {
      if (post) post.style.setProperty('opacity', '1');
    }, 1000);
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
              onSuccess={refetchAndScrollToPost}
              onProgress={handleData}
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
