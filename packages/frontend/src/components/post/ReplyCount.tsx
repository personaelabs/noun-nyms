import { replyText as TEXT } from '@/lib/text';
import { UserContext } from '@/pages/_app';
import { UserContextType } from '@/types/components';
import { faMessage } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useContext } from 'react';

export const ReplyCount = (replyCountProps: { count: number }) => {
  const { count } = replyCountProps;
  const { isMobile } = useContext(UserContext) as UserContextType;

  return (
    <div className="flex gap-1 justify-center items-center hover:underline">
      {isMobile && <FontAwesomeIcon icon={faMessage} color={'#d0d5dd'} />}
      <p className="postDetail">{count}</p>
      {!isMobile && <p className="secondary">{count === 1 ? TEXT.reply : TEXT.replies}</p>}
    </div>
  );
};
