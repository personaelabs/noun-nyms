import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { PostWithReplies } from './PostWithReplies';
import { PostProps } from '@/types/components';
import * as React from 'react';
import { IRootPost } from '@/types/api';
import { ReplyCount } from './ReplyCount';
import { UserTag } from './UserTag';
const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime);

/** Note: Post.tsx handles the state of the modal and formats the timestamp */

export const Post = (postProps: PostProps) => {
  const { body, timestamp, replyCount, shouldOpenModal, userId } = postProps;

  const [isOpen, setIsOpen] = useState(shouldOpenModal || false);
  // TODO: after we add wagmi
  //  const { address } = useAccount();

  const openModal = () => {
    setIsOpen(true);
  };

  if (shouldOpenModal) console.log({ body });

  // TODO figure out how to pass in the comments
  const dateFromDescription = useMemo(() => {
    const date = dayjs(timestamp);
    // Dayjs doesn't have typings on relative packages so we have to do this
    // @ts-ignore
    return date.fromNow();
  }, [timestamp]);

  return (
    <>
      <PostWithReplies
        {...postProps}
        dateFromDescription={dateFromDescription}
        isOpen={isOpen}
        handleClose={(e: any) => {
          setIsOpen(false);
        }}
      />
      <div
        onClick={openModal}
        className="rounded-2xl transition-all shadow-sm bg-white p-3 md:px-5 md:py-4 flex flex-col gap-4 justify-between border border-gray-200 hover:border-gray-300 hover:cursor-pointer w-full"
      >
        <div className="self-start line-clamp-2">
          <h4 className="tracking-tight">{body}</h4>
        </div>
        <span>{body}</span>
        <div className="flex justify-between items-center">
          <UserTag userId={userId} date={dateFromDescription} />
          <ReplyCount count={replyCount} />
        </div>
      </div>
    </>
  );
};
