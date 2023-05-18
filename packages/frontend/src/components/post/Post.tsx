import dayjs from 'dayjs';
import { PostProps } from '@/types/components';
import { ReplyCount } from './ReplyCount';
import { UserTag } from './UserTag';

/** Note: Post.tsx handles the state of the modal and formats the timestamp */

export const Post = (postProps: PostProps) => {
  const { title, body, timestamp, replyCount, handleOpenPost, userId } = postProps;

  return (
    <div
      onClick={handleOpenPost}
      className="rounded-2xl transition-all shadow-sm bg-white p-3 md:px-5 md:py-4 flex flex-col gap-4 justify-between border border-gray-200 hover:border-gray-300 hover:cursor-pointer w-full"
    >
      <div className="self-start line-clamp-2">
        <h4 className="tracking-tight">{title}</h4>
      </div>
      <span>{body}</span>
      <div className="flex justify-between items-center">
        <UserTag userId={userId} timestamp={timestamp} />
        <ReplyCount count={replyCount} />
      </div>
    </div>
  );
};
