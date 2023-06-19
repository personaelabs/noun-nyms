import { useContext, useState } from 'react';
import { PostWithReplies } from './PostWithReplies';
import { Modal } from '../global/Modal';
import { DiscardPostWarning } from '../DiscardPostWarning';
import { UserContext } from '@/pages/_app';
import { UserContextType } from '@/types/components';

interface PostWithRepliesModalProps {
  openPostId: string;
  setOpenPostId: (id: string) => void;
  writerToShow?: string;
}

export const PostWithRepliesModal = (props: PostWithRepliesModalProps) => {
  const { openPostId, setOpenPostId, writerToShow } = props;
  const [discardWarningOpen, setDiscardWarningOpen] = useState(false);
  const { postInProg } = useContext(UserContext) as UserContextType;

  const handleCloseModal = () => {
    window.history.pushState(null, '', '/');
    setOpenPostId('');
  };

  return (
    <>
      <DiscardPostWarning
        isOpen={discardWarningOpen}
        handleCloseWarning={() => setDiscardWarningOpen(false)}
        handleClosePost={() => {
          handleCloseModal();
          setDiscardWarningOpen(false);
        }}
      />
      <Modal
        isOpen={true}
        startAtTop={true}
        handleClose={() => {
          if (postInProg) setDiscardWarningOpen(true);
          else handleCloseModal();
        }}
      >
        <PostWithReplies writerToShow={writerToShow} postId={openPostId} />
      </Modal>
    </>
  );
};
