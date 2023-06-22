import { postWithReplies as TEXT } from '@/lib/text';
import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface ShowMoreProps {
  handler: () => void;
  errorMsg: string;
  loading: boolean;
  text?: { before: string; after: string };
}

export const ShowMore = (props: ShowMoreProps) => {
  const { handler, errorMsg, loading, text } = props;

  const beforeText = text ? text.before : TEXT.showMoreReplies;
  const afterText = text ? text.after : TEXT.showingMoreReplies;

  return (
    <button className="flex cursor-pointer" onClick={handler}>
      {errorMsg ? (
        <p className="error">
          {errorMsg + ' '}
          <span>
            <FontAwesomeIcon icon={faRefresh} />
          </span>
        </p>
      ) : (
        <p className="hover:underline font-semibold text-xs cursor-pointer">
          {loading ? afterText : beforeText}
        </p>
      )}
    </button>
  );
};
