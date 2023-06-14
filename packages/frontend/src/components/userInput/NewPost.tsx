import { PostWriter } from './PostWriter';
import { Modal } from '../global/Modal';
import text from '@/lib/text.json';

interface NewPostProps {
  handleClose: () => void;
  scrollToPost: (id: string) => Promise<void>;
}
export const NewPost = (props: NewPostProps) => {
  const { handleClose, scrollToPost } = props;
  const TEXT = text.newPost;

  return (
    <Modal handleClose={handleClose}>
      <div className="flex flex-col gap-4 py-8 px-12 md:px-12 md:py-10">
        <div className="flex justify-start">
          <h3>{TEXT.title}</h3>
        </div>
        <PostWriter parentId={'0x0'} scrollToPost={scrollToPost} handleCloseWriter={handleClose} />
      </div>
    </Modal>
  );
};
