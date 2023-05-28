export const ReplyCount = (replyCountProps: { count: number }) => {
  const { count } = replyCountProps;

  return (
    <div className="flex gap-1 items-center">
      <p className="postDetail">{count}</p>
      <p className="secondary">{count === 1 ? 'reply' : 'replies'}</p>
    </div>
  );
};
