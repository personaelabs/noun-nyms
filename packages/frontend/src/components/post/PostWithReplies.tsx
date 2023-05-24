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
import Spinner from '../global/Spinner';

const getPostById = async (postId: string, fromRoot = false) =>
  (await axios.get<IPostWithReplies>(`/api/v1/posts/${postId}?fromRoot=${fromRoot}`)).data;

export const PostWithReplies = (postWithRepliesProps: PostWithRepliesProps) => {
  const { writerToShow, handleClose, postId } = postWithRepliesProps;
  const fromRoot = true;
  const { refetch, data: singlePost } = useQuery<IPostWithReplies>({
    queryKey: ['post', postId, fromRoot],
    queryFn: () => getPostById(postId, fromRoot),
    retry: 1,
    enabled: true,
    staleTime: 5000,
    refetchIntervalInBackground: true,
    refetchInterval: 30000, // 30 seconds
  });

  const nestedComponentThreads = useMemo(() => {
    if (singlePost) {
      return resolveNestedReplyThreads(singlePost.replies, 0, refetch, writerToShow);
    } else {
      return <div></div>;
    }
  }, [singlePost, refetch, writerToShow]);

  return (
    <Modal startAtTop={true} handleClose={handleClose}>
      {singlePost ? (
        <>
          {' '}
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
            <PostWriter parentId={(singlePost.parentId as PrefixedHex) || ''} onSuccess={refetch} />
            <>
              <h4>{singlePost.replies.length === 1 ? 'reply' : 'replies'}</h4>
              <div className="flex flex-col gap-6 w-full justify-center items-center">
                {nestedComponentThreads}
              </div>
            </>
          </div>
        </>
      ) : (
        <Spinner />
      )}
    </Modal>
  );
};
