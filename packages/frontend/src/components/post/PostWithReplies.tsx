import { useEffect, useMemo, useState } from 'react';
import { PostWriter } from '../userInput/PostWriter';
import { resolveNestedReplyThreads } from '@/components/post/NestedReply';
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
import { refetchAndScrollToPost, scrollToPost } from '@/lib/client-utils';

const getPostById = async (postId: string, fromRoot = false) =>
  (await axios.get<IPostWithReplies>(`/api/v1/posts/${postId}?fromRoot=${fromRoot}`)).data;

export const PostWithReplies = (postWithRepliesProps: PostWithRepliesProps) => {
  const { postId } = postWithRepliesProps;

  const fromRoot = true;
  const { errorMsg, setError } = useError();

  const [parent, setParent] = useState<IPostWithReplies>();

  const {
    isLoading,
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

  const topPost = useMemo(() => {
    return parent || singlePost;
  }, [singlePost, parent]);

  const nestedComponentThreads = useMemo(() => {
    const handleSuccess = async (id?: string) => {
      await refetchAndScrollToPost(refetch, id);
    };

    if (parent) {
      return resolveNestedReplyThreads([parent], parent.depth, handleSuccess);
    } else if (singlePost) {
      // If singlePost is root, pass its replies.
      // If singlePost is not root, pass it as a list
      const postToPass = !singlePost.rootId ? singlePost.replies : [singlePost];
      return resolveNestedReplyThreads(postToPass, singlePost.depth, handleSuccess);
    } else {
      return <div></div>;
    }
  }, [parent, singlePost, refetch]);

  useEffect(() => {
    //if post is not the root, scroll to post
    if (singlePost && singlePost.id !== postId) {
      setTimeout(async () => await scrollToPost(postId), 500);
    }
  }, [postId, singlePost]);

  return (
    <>
      {singlePost?.root ? (
        <>
          <div className="flex flex-col gap-4 py-6 px-6 md:px-12 md:py-10">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between item-center">
                <div className="self-start line-clamp-2">
                  <h3 className="tracking-tight">{singlePost.root.title}</h3>
                </div>
              </div>
              <p>{singlePost.root.body}</p>
            </div>
            <div className="flex gap-2 flex-wrap justify-between pt-2 border-t border-dotted border-gray-300 items-center">
              <UserTag userId={singlePost.root.userId} timestamp={singlePost.root.timestamp} />
              <div className="flex gap-2">
                <ReplyCount count={singlePost.root._count.descendants} />
                <div className="border-l border-dotted border-gray-200 pl-2">
                  <Upvote
                    upvotes={singlePost.root.upvotes}
                    postId={singlePost.root.id}
                    onSuccess={refetch}
                  >
                    <p>{singlePost.root.upvotes.length}</p>
                  </Upvote>
                </div>
              </div>
            </div>
          </div>
          <div className="flex grow flex-col gap-8 w-full bg-gray-50 p-6">
            <PostWriter
              parentId={singlePost.id as PrefixedHex}
              scrollToPost={async (postId) => await refetchAndScrollToPost(refetch, postId)}
            />
            <>
              <h4>
                {singlePost.root._count.descendants}{' '}
                {singlePost.root._count.descendants === 1 ? 'reply' : 'replies'}
              </h4>
              <div className="flex flex-col gap-6 w-full justify-center items-center">
                {topPost && topPost.depth > 1 ? (
                  <button
                    className="text-left"
                    onClick={async () => {
                      const res = await axios.get<IPostWithReplies>(
                        `/api/v1/posts/${topPost?.id}/parents`,
                      );
                      console.log(`parents!`, res.data);
                      setParent(res.data);
                    }}
                  >
                    Fetch parents
                  </button>
                ) : (
                  <></>
                )}
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
