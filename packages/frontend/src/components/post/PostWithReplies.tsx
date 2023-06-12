import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { PrefixedHex } from '@personaelabs/nymjs';
import useError from '@/hooks/useError';
import { PostWriter } from '@/components/userInput/PostWriter';
import { resolveNestedReplyThreads } from '@/components/post/NestedReply';
import { useQuery } from '@tanstack/react-query';
import { IPostWithReplies } from '@/types/api';
import { PostWithRepliesProps } from '@/types/components';
import { ReplyCount } from './ReplyCount';
import { UserTag } from './UserTag';
import { Upvote } from '../Upvote';
import Spinner from '../global/Spinner';
import { RetryError } from '../global/RetryError';
import { refetchAndScrollToPost, scrollToPost } from '@/lib/client-utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRefresh } from '@fortawesome/free-solid-svg-icons';

const getPostById = async (postId: string) =>
  (await axios.get<IPostWithReplies>(`/api/v1/posts/${postId}`)).data;

export const PostWithReplies = (postWithRepliesProps: PostWithRepliesProps) => {
  const { postId, writerToShow } = postWithRepliesProps;

  const { errorMsg, setError } = useError();
  const [parent, setParent] = useState<IPostWithReplies>();
  const [loadingLocalFetch, setLoadingLocalFetch] = useState(false);
  const [postToHighlight, setPostToHighlight] = useState('');

  const {
    isLoading,
    isError,
    refetch,
    data: singlePost,
    isFetched,
  } = useQuery<IPostWithReplies>({
    queryKey: ['post', postId],
    queryFn: () => getPostById(postId),
    retry: 1,
    enabled: !!postId,
    staleTime: 5000,
    refetchIntervalInBackground: true,
    refetchInterval: 30000, // 30 seconds
    onError: (error) => {
      setError(error);
    },
    onSuccess: () => setError(''),
  });

  // set the initial post to highlight if singlePost is not the root
  useEffect(() => {
    if (isFetched && singlePost) {
      const toHighlight = !singlePost.root ? '' : postId;
      setPostToHighlight(toHighlight);
    }
  }, [isFetched, postId, singlePost, isError, setError]);

  // The top Reply is the first post below the root. It can change if parents are fetched for a reply.
  const topReply = useMemo(() => {
    return parent || singlePost;
  }, [singlePost, parent]);

  const root = useMemo(() => {
    if (singlePost) {
      return singlePost?.root || singlePost;
    }
  }, [singlePost]);

  const nestedComponentThreads = useMemo(() => {
    if (topReply) {
      // If topReply is root, pass its replies.
      // If topReply is not root, pass it as a list
      const postToPass = !topReply.rootId ? topReply.replies : [topReply];
      return resolveNestedReplyThreads(postToPass, 0, postToHighlight, writerToShow);
    } else {
      return <div></div>;
    }
  }, [topReply, writerToShow, postToHighlight]);

  const fetchParents = async (id: string) => {
    try {
      setError('');
      setLoadingLocalFetch(true);
      const res = await axios.get<IPostWithReplies>(`/api/v1/posts/${id}/parents`);
      setPostToHighlight(id);
      setParent(res.data);
    } catch (error) {
      setError(error);
    } finally {
      setLoadingLocalFetch(false);
    }
  };

  useEffect(() => {
    //if post is not the root, scroll to post
    if (singlePost && singlePost.id !== postId) {
      setTimeout(async () => await scrollToPost(postId), 500);
    }
  }, [postId, singlePost]);

  return (
    <>
      {root ? (
        <>
          <div className="flex flex-col gap-4 py-6 px-6 md:px-12 md:py-10">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between item-center">
                <div className="self-start line-clamp-2">
                  <h3 className="tracking-tight">{root.title}</h3>
                </div>
              </div>
              <p>{root.body}</p>
            </div>
            <div className="flex gap-2 flex-wrap justify-between pt-2 border-t border-dotted border-gray-300 items-center">
              <UserTag userId={root.userId} timestamp={root.timestamp} />
              <div className="flex gap-2">
                <ReplyCount count={root._count.descendants} />
                <div className="border-l border-dotted border-gray-200 pl-2">
                  <Upvote upvotes={root.upvotes} postId={root.id} onSuccess={refetch}>
                    <p>{root.upvotes.length}</p>
                  </Upvote>
                </div>
              </div>
            </div>
          </div>
          <div className="flex grow flex-col gap-8 w-full bg-gray-50 p-6">
            <PostWriter
              parentId={root.id as PrefixedHex}
              scrollToPost={async (postId) => await refetchAndScrollToPost(refetch, postId)}
            />
            <>
              <h4>
                {root._count.descendants} {root._count.descendants === 1 ? 'reply' : 'replies'}
              </h4>
              <div className="flex flex-col gap-4">
                {topReply && (
                  <button className="w-max" onClick={() => fetchParents(topReply.id)}>
                    {errorMsg ? (
                      <p className="error cursor-pointer">
                        {errorMsg + ' '}
                        <span>
                          <FontAwesomeIcon icon={faRefresh} />
                        </span>
                      </p>
                    ) : topReply && topReply.depth > 1 ? (
                      <p className="hover:underline font-semibold text-xs cursor-pointer">
                        {loadingLocalFetch ? 'Showing parent comments...' : 'Show parent comments'}
                      </p>
                    ) : (
                      <></>
                    )}
                  </button>
                )}
                <div className="flex flex-col gap-6 w-full justify-center items-center">
                  {nestedComponentThreads}
                </div>
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
