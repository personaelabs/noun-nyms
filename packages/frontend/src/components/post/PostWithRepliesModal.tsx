import { useState } from 'react';
import { PostWithReplies } from './PostWithReplies';
import { Modal } from '../global/Modal';
import { useRouter } from 'next/router';
import { DiscardPostWarning } from '../DiscardPostWarning';

interface PostWithRepliesModalProps {
  openPostId: string;
  setOpenPostId: (id: string) => void;
  writerToShow?: string;
}

export const PostWithRepliesModal = (props: PostWithRepliesModalProps) => {
  const { openPostId, setOpenPostId, writerToShow } = props;
  const router = useRouter();
  const handlePostInProg = (post: string) => setPostInProg(post);
  const [postInProg, setPostInProg] = useState('');
  const [discardWarningOpen, setDiscardWarningOpen] = useState(false);

  const handleCloseModal = () => {
    router.replace('/', undefined, { shallow: true });
    setOpenPostId('');
  };

  return (
    <>
      {discardWarningOpen && (
        <DiscardPostWarning
          handleCloseWarning={() => setDiscardWarningOpen(false)}
          handleClosePost={() => {
            handleCloseModal();
            setDiscardWarningOpen(false);
          }}
        />
      )}
      <Modal
        startAtTop={true}
        handleClose={() => {
          if (postInProg) setDiscardWarningOpen(true);
          else handleCloseModal();
        }}
      >
        <PostWithReplies
          writerToShow={writerToShow}
          postId={openPostId}
          onData={handlePostInProg}
        />
      </Modal>
    </>
  );
};
