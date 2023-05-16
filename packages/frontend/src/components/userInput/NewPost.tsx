import { PostWriter } from './PostWriter';
import { Modal } from '../global/Modal';

interface NewPostProps {
  handleClose: () => void;
  onSuccess: () => void;
}
export const NewPost = (props: NewPostProps) => {
  const { handleClose, onSuccess } = props;

  return (
    <Modal handleClose={handleClose}>
      <div className="flex flex-col gap-4 py-8 px-12 md:px-12 md:py-10">
        <div className="flex justify-start">
          <h3>Start a discussion here</h3>
        </div>
        <PostWriter parentId={'0x0'} onSuccess={onSuccess} />
      </div>
    </Modal>
  );
};
