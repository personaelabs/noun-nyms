import { PostProps, UserContextType } from '@/types/components';
import { ReplyCount } from './ReplyCount';
import { UserTag } from './UserTag';
import { SingleReply } from './SingleReply';
import useName from '@/hooks/useName';
import { CopyLink } from './CopyLink';
import { UserContext } from '@/pages/_app';
import { useContext } from 'react';

export const PostPreview = (postProps: PostProps) => {
  const { post, showUserHeader, handleOpenPost, onSuccess } = postProps;

  const { id, body, timestamp, userId, parent, root, title, _count } = post;

  const { name: userName } = useName({ userId });
  const { name: rootName } = useName({ userId: root?.userId });
  useName({ userId: root?.userId });
  const { pushRoute } = useContext(UserContext) as UserContextType;

  return (
    <>
      <div
        id={id}
        onClick={() => handleOpenPost('')}
        className="min-w-0 grow rounded-2xl transition-all shadow-sm bg-white p-3 md:px-5 md:py-4 flex flex-col gap-4 border border-gray-200 hover:border-gray-300 hover:cursor-pointer"
      >
        {root ? (
          <div className="flex flex-col gap-2">
            <p>
              <span
                className="postDetail cursor-pointer hover:underline break-words"
                onClick={() => pushRoute(`/users/${userId}`)}
              >
                {userName}
              </span>
              <span className="secondary"> commented on </span>
              <span className="postDetail cursor-pointer hover:underline">{root.title}</span>
            </p>
            <div className="breakText secondary" onClick={() => pushRoute(`/users/${root.userId}`)}>
              Posted by <strong className="cursor-pointer hover:underline">{rootName}</strong>
            </div>
          </div>
        ) : (
          <>
            {showUserHeader ? <p className="secondary breakText">Posted by {userName}</p> : null}
            <h4 className="cursor-pointer hover:underline tracking-tight">{title}</h4>
          </>
        )}
        {parent ? (
          <div className="flex flex-col gap-2">
            <UserTag userId={parent.userId} timestamp={parent.timestamp} />
            <div className="flex flex-col gap-2 ml-3 pl-2 border-l border-dotted border-gray-300">
              <span>{parent.body}</span>
              <div className="p-4 rounded-xl bg-gray-50" style={{ marginLeft: 10 }}>
                <SingleReply
                  post={post}
                  replyCount={_count.descendants}
                  onUpvote={onSuccess}
                  replyOpen={false}
                  handleReply={(writerToShow: string) => handleOpenPost(writerToShow)}
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            <span>{body}</span>
            <div className="min-w-0 flex flex-wrap gap-2 justify-between items-center">
              <UserTag userId={userId} timestamp={timestamp} />
              <div className="flex gap-4">
                <ReplyCount count={_count.descendants} />
                <CopyLink id={id} />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};
