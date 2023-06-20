import { PostWriter } from './PostWriter';
import { Modal } from '../global/Modal';
import { newPost as TEXT } from '@/lib/text';

interface NewPostProps {
  isOpen: boolean;
  handleClose: () => void;
  scrollToPost: (id: string) => Promise<void>;
}
export const NewPost = (props: NewPostProps) => {
  const { isOpen, handleClose, scrollToPost } = props;

  return (
    <Modal isOpen={isOpen} handleClose={handleClose}>
      <div className="flex justify-start">
        <h3>{TEXT.title}</h3>
      </div>
      <PostWriter parentId={'0x0'} scrollToPost={scrollToPost} handleCloseWriter={handleClose} />
    </Modal>
  );
};
