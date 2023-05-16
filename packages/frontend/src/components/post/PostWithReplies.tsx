import { useMemo } from 'react';
import { CommentWriter } from '../userInput/CommentWriter';
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

const getPostById = async (postId: string) =>
  (await axios.get<IPostWithReplies>(`/api/v1/posts/${postId}`)).data;

export const PostWithReplies = (postWithRepliesProps: PostWithRepliesProps) => {
  const { id, isOpen, handleClose, dateFromDescription, title, body, replyCount, userId, upvotes } =
    postWithRepliesProps;

  //TODO: Note that this call happens regardless of if isOpen is true or not
  const { isLoading, data: singlePost } = useQuery<IPostWithReplies>({
    queryKey: ['post', id],
    queryFn: () => getPostById(id),
    retry: 1,
    enabled: true,
    staleTime: 1000,
  });

  const nestedComponentThreads = useMemo(() => {
    if (singlePost) {
      return resolveNestedReplyThreads(singlePost.replies, 0);
    } else {
      return <div></div>;
    }
  }, [singlePost]);

  return (
    <Modal isOpen={isOpen} handleClose={handleClose}>
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
            <Upvote upvotes={upvotes} postId={id}>
              <p>{upvotes.length}</p>
            </Upvote>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-8 w-full bg-gray-50 px-12 py-8">
        <CommentWriter parentId={id as PrefixedHex} />
        <h4>
          {singlePost?.replies.length} {singlePost?.replies.length === 1 ? 'comment' : 'comments'}
        </h4>
        <div className="flex flex-col gap-6 w-full justify-center iterms-center">
          {nestedComponentThreads}
        </div>
      </div>
    </Modal>
  );
};
