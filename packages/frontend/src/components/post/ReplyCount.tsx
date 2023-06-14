import text from '@/lib/text.json';
export const ReplyCount = (replyCountProps: { count: number }) => {
  const { count } = replyCountProps;
  const TEXT = text.replyText;

  return (
    <div className="flex gap-1 items-center hover:underline">
      <p className="postDetail">{count}</p>
      <p className="secondary">{count === 1 ? TEXT.reply : TEXT.replies}</p>
    </div>
  );
};
