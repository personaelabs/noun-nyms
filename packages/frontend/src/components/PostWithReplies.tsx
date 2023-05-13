import { Dialog } from '@headlessui/react';
import { useMemo } from 'react';
import { CommentWriter } from './CommentWriter';
import { resolveNestedComponentThreads } from './NestedComponent';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { IPostWithReplies } from '@/types/api';
import { PostWithRepliesProps } from '@/types/components';

const getPostById = async (postId: string) =>
  (await axios.get<IPostWithReplies>(`/api/v1/posts/${postId}`)).data;

export const PostWithReplies = (postWithRepliesProps: PostWithRepliesProps) => {
  const { id, isOpen, handleClose, dateFromDescription, title, body, replyCount, userId } =
    postWithRepliesProps;

  //TODO: Note that this call happens regardless of if isOpen is true or not
  const { isLoading, data: singlePost } = useQuery<IPostWithReplies>({
    queryKey: ['post', id],
    queryFn: () => getPostById(id),
    retry: 1,
    enabled: true,
    staleTime: 1000,
  });
  console.log(singlePost);

  const nestedComponentThreads = useMemo(() => {
    if (singlePost) {
      return resolveNestedComponentThreads(singlePost.replies, 0);
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
            <div className="flex justify-end sm:hidden">
              <button
                className="w-fit border font-bold bg-black border-black text-white rounded-full px-1.5"
                onClick={handleClose as any}
              >
                X
              </button>
            </div>

            <div className="py-8 px-12 md:px-12 md:py-10">
              <div className="flex justify-between item-center">
                <div className="text-lg md:text-xl font-bold self-start line-clamp-2">
                  <span className="text-black tracking-tight font-bold">{title}</span>
                </div>
                <button
                  style={{ color: 'gray' }}
                  className="w-fit font-bold focus:outline-0"
                  onClick={handleClose as any}
                >
                  X
                </button>
              </div>
              <div className="py-1"></div>
              <span>{body}</span>
              <div className="py-3"></div>
              <div className="flex justify-between items-center">
                <div className="flex justify-center items-center">
                  <p className="font-bold">{userId}</p>
                  <div className="px-2"></div>
                  <p style={{ color: 'gray' }}>{dateFromDescription}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p style={{ color: 'gray' }}>{replyCount} replies</p>
                  <div className="px-2"></div>
                </div>
              </div>
            </div>
            <div className="flex flex-col w-full bg-slate-100 px-12 py-8">
              <CommentWriter commentId={id} />
              <div className="py-8"></div>
              <p className="font-bold" style={{ color: 'gray' }}>
                {singlePost?.replies.length} replies
              </p>
              <div className="py-3"></div>
              <div className="flex flex-col w-full justify-center iterms-center">
                {nestedComponentThreads}
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};
