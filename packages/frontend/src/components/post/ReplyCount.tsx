import { replyText as TEXT } from '@/lib/text';

export const ReplyCount = (replyCountProps: { count: number }) => {
  const { count } = replyCountProps;

  return (
    <div className="flex gap-1 items-center hover:underline">
      <p className="postDetail">{count}</p>
      <p className="secondary">{count === 1 ? TEXT.reply : TEXT.replies}</p>
    </div>
  );
};
