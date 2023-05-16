import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { PostWithReplies } from './PostWithReplies';
import { PostProps } from '@/types/components';
import { ReplyCount } from './ReplyCount';
import { UserTag } from './UserTag';
const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime);

/** Note: Post.tsx handles the state of the modal and formats the timestamp */

export const Post = (postProps: PostProps) => {
  const { title, body, timestamp, replyCount, handleOpenPost, userId } = postProps;

  // TODO figure out how to pass in the comments
  const dateFromDescription = useMemo(() => {
    const date = dayjs(timestamp);
    // Dayjs doesn't have typings on relative packages so we have to do this
    // @ts-ignore
    return date.fromNow();
  }, [timestamp]);

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
        <UserTag userId={userId} date={dateFromDescription} />
        <ReplyCount count={replyCount} />
      </div>
    </div>
  );
};
