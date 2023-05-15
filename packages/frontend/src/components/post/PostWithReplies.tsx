import { Dialog } from '@headlessui/react';
import { useMemo } from 'react';
import { CommentWriter } from '../userInput/CommentWriter';
import { resolveNestedReplyThreads } from './NestedReply';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { IPostWithReplies } from '@/types/api';
import { PostWithRepliesProps } from '@/types/components';
import { ReplyCount } from './ReplyCount';
import { UserTag } from './UserTag';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { UpvoteIcon } from '../UpvoteIcon';

const getPostById = async (postId: string) =>
  (await axios.get<IPostWithReplies>(`/api/v1/posts/${postId}`)).data;

export const PostWithReplies = (postWithRepliesProps: PostWithRepliesProps) => {
  const { id, isOpen, handleClose, dateFromDescription, title, body, replyCount, userId, upvotes } =
    postWithRepliesProps;

  if (isOpen) console.log({ id });

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
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      {/* The backdrop, rendered as a fixed sibling to the panel container */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center">
          <Dialog.Panel className="w-full max-w-5xl bg-white mx-8 rounded-md">
            <div className="flex justify-end sm:hidden p-4 cursor-pointer">
              <FontAwesomeIcon icon={faXmark} color="#98A2B3" onClick={handleClose as any} />
            </div>

            <div className="flex flex-col gap-4 py-8 px-12 md:px-12 md:py-10">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between item-center">
                  <div className="self-start line-clamp-2">
                    <h3 className="tracking-tight">{title}</h3>
                  </div>
                  <div className="invisible sm:visible cursor-pointer">
                    <FontAwesomeIcon icon={faXmark} color="#98A2B3" onClick={handleClose as any} />
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
                  <UpvoteIcon count={upvotes.length} />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-8 w-full bg-gray-50 px-12 py-8">
              <CommentWriter commentId={id} />
              <h4>
                {singlePost?.replies.length}{' '}
                {singlePost?.replies.length === 1 ? 'comment' : 'comments'}
              </h4>
              <div className="flex flex-col gap-6 w-full justify-center iterms-center">
                {nestedComponentThreads}
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};