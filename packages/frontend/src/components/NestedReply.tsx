import { useMemo } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
import { ButtonIcon } from './ButtonIcon';
import { IPostWithReplies, IRootPost } from '@/types/api';
import { ReplyCount } from './ReplyCount';
import { UserTag } from './UserTag';

interface IReplyProps extends IPostWithReplies {
  depth: number;
  innerReplies: React.ReactNode;
  profileImgURL: string;
  proof: string;
  childrenLength: number;
  createdAt: Date;
}
export const resolveNestedReplyThreads = (allPosts: IPostWithReplies[], depth: number) => {
  const replyNodes: React.ReactNode[] = [];
  const profileImgURL = '';
  const proof = '';
  for (const post of allPosts) {
    replyNodes.push(
      <NestedReply
        {...post}
        key={post.id}
        depth={depth}
        createdAt={new Date(post.timestamp)}
        innerReplies={resolveNestedReplyThreads(post.replies, depth + 1)}
        profileImgURL={profileImgURL}
        proof={proof}
        childrenLength={post.replies.length}
      />,
    );
  }
  return replyNodes;
};

export const NestedReply = (replyProps: IReplyProps) => {
  const {
    depth,
    id,
    body,
    createdAt,
    userId,
    innerReplies,
    profileImgURL,
    childrenLength,
    upvotes,
  } = replyProps;
  const dateFromDescription = useMemo(() => {
    const date = dayjs(createdAt);
    // Dayjs doesn't have typings on relative packages so we have to do this
    // @ts-ignore
    return date.fromNow();
  }, [createdAt]);

  return (
    // TODO: fix border here
    <div
      className="flex flex-col gap-2 pl-2 border-l border-dotted border-gray-300"
      key={id}
      style={{ marginLeft: `${depth * 20}px` }}
    >
      <UserTag imgURL={profileImgURL} userId={userId} date={dateFromDescription} />
      <span>{body}</span>
      <div className="flex justify-between items-center py-2 border-t border-gray-300">
        <div className="flex justify-center items-center">
          <ButtonIcon
            onClick={() => console.log('clicked')}
            iconPath="/upvote.svg"
            bgColor="#D0D5DD"
            hoverBgColor="#0E76FD"
            iconWidth={20}
            iconHeight={20}
            iconText={upvotes.length.toString()}
          />
          <div className="px-1"></div>
        </div>
        <div className="flex gap-4 justif-center items-center">
          <ReplyCount count={childrenLength} />
          <ButtonIcon
            onClick={() => console.log('clicked')}
            iconPath="/reply.svg"
            bgColor="#D0D5DD"
            hoverBgColor="#0E76FD"
            iconWidth={15}
            iconHeight={12.5}
            iconText={'Reply'}
          />
        </div>
      </div>
      <div className="py-2"></div>
      {innerReplies}
    </div>
  );
};
