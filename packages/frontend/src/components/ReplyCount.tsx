export const ReplyCount = (replyCountProps: { count: number }) => {
  const { count } = replyCountProps;

  return (
    <div className="flex gap-2 items-center">
      <p className="font-semibold text-gray-700">{count}</p>
      <p className="secondary">{count === 1 ? 'reply' : 'replies'}</p>
    </div>
  );
};
