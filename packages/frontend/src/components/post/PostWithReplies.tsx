import { useMemo } from 'react';
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
import { Modal } from '../global/Modal';
import dayjs from 'dayjs';
import Spinner from '../global/Spinner';

const getPostById = async (postId: string) =>
  (await axios.get<IPostWithReplies>(`/api/v1/posts/${postId}`)).data;

export const PostWithReplies = (postWithRepliesProps: PostWithRepliesProps) => {
  const { handleClose, rootId, id, root, ...restPost } = postWithRepliesProps;

  // If root exists, render that. otherewise render post (which is a root).
  const getTopPost = () => {
    if (root) {
      const { _count, ...restRoot } = root;
      return { ...restRoot, replyCount: _count.descendants };
    } else {
      return { ...restPost };
    }
  };

  const { userId, title, body, replyCount, timestamp, upvotes } = getTopPost();

  const postId = rootId || id;
  const {
    isRefetching,
    isFetching,
    isLoading,
    refetch,
    data: singlePost,
  } = useQuery<IPostWithReplies>({
    queryKey: ['post', postId],
    queryFn: () => getPostById(postId),
    retry: 1,
    enabled: true,
    staleTime: 5000,
    refetchIntervalInBackground: true,
    refetchInterval: 30000, // 30 seconds
  });

  isRefetching ? console.log(`is refetching ${postId}`) : '';
  isFetching ? console.log(`is fetching ${postId}`) : '';

  const dateFromDescription = useMemo(() => {
    const date = dayjs(timestamp);
    // Dayjs doesn't have typings on relative packages so we have to do this
    // @ts-ignore
    return date.fromNow();
  }, [timestamp]);

  const nestedComponentThreads = useMemo(() => {
    if (singlePost) {
      return resolveNestedReplyThreads(singlePost.replies, 0, refetch);
    } else {
      return <div></div>;
    }
  }, [singlePost, refetch]);

  return (
    <Modal startAtTop={true} handleClose={handleClose}>
      <div className="flex flex-col gap-4 py-8 px-12 md:px-12 md:py-10">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between item-center">
            <div className="self-start line-clamp-2">
              <h3 className="tracking-tight">{title}</h3>
            </div>
          </div>
          <p>{body}</p>
        </div>
        <div className="h-[1px] border border-dotted border-gray-200" />
        <div className="flex justify-between items-center">
          <UserTag userId={userId} date={dateFromDescription} />
          <div className="flex gap-4">
            <ReplyCount count={replyCount} />
            <div className="w-[1px] border border-dotted border-gray-200" />
            <Upvote upvotes={upvotes} postId={id} onSuccess={refetch}>
              <p>{upvotes.length}</p>
            </Upvote>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-8 w-full bg-gray-50 px-12 py-8">
        <PostWriter parentId={id as PrefixedHex} onSuccess={refetch} />
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <h4>
              {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
            </h4>
            <div className="flex flex-col gap-6 w-full justify-center iterms-center">
              {nestedComponentThreads}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
