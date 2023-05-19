import { PostProps } from '@/types/components';
import { ReplyCount } from './ReplyCount';
import { UserTag } from './UserTag';
import { Upvote } from '../Upvote';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faReply } from '@fortawesome/free-solid-svg-icons';

/** Note: Post.tsx handles the state of the modal and formats the timestamp */

export const PostPreview = (postProps: PostProps) => {
  const {
    title,
    id,
    body,
    upvotes,
    timestamp,
    _count,
    userId,
    parent,
    root,
    handleOpenPost,
    onSuccess,
  } = postProps;

  return (
    <>
      <div
        onClick={handleOpenPost}
        className="rounded-2xl transition-all shadow-sm bg-white p-3 md:px-5 md:py-4 flex flex-col gap-4 justify-between border border-gray-200 hover:border-gray-300 hover:cursor-pointer w-full"
      >
        {root ? (
          <div className="flex flex-col gap-2">
            <p className="postDetail">{root.title}</p>
            <p className="secondary">
              Posted by <strong>{root.userId}</strong>
            </p>
          </div>
        ) : (
          <h4 className="tracking-tight">{title}</h4>
        )}
        {parent ? (
          <>
            <UserTag userId={parent.userId} timestamp={parent.timestamp} />
            <span>{parent.body}</span>
            <div className="p-4 rounded-xl bg-gray-50" style={{ marginLeft: 20 }}>
              <div className="flex flex-col gap-2 pl-2 border-l border-dotted border-gray-300">
                <div className="self-start line-clamp-2"></div>
                <UserTag userId={userId} timestamp={timestamp} />
                <span>{body}</span>
                <div className="flex gap-2 justify-between">
                  <Upvote upvotes={upvotes} postId={id} onSuccess={onSuccess}>
                    <p className="postDetail">{upvotes.length}</p>
                  </Upvote>
                  <div className="flex gap-2">
                    <ReplyCount count={_count.descendants} />
                    <div
                      className="flex gap-2 items-center cursor-pointer hoverIcon"
                      onClick={handleOpenPost}
                    >
                      <FontAwesomeIcon className="hoverIcon" icon={faReply} />
                      <p className="text-gray-700">Reply</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <span>{body}</span>
            <div className="flex justify-between items-center">
              <UserTag userId={userId} timestamp={timestamp} />
              <ReplyCount count={_count.descendants} />
            </div>
          </>
        )}
      </div>
    </>
  );
};
