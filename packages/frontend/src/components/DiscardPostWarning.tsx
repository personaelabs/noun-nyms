import { MainButton } from './MainButton';
import { Modal } from './global/Modal';
import { discardPostWarning as TEXT } from '@/lib/text';

interface DiscardPostWarningProps {
  handleClosePost: () => void;
  handleCloseWarning: () => void;
}

export const DiscardPostWarning = (props: DiscardPostWarningProps) => {
  const { handleCloseWarning, handleClosePost } = props;
  return (
    <Modal handleClose={handleCloseWarning} width={'50%'}>
      <p>{TEXT.body}</p>

      <div className="flex gap-2 justify-center">
        <MainButton message={TEXT.buttonText.cancel} color="#000000" handler={handleCloseWarning} />
        <MainButton message={TEXT.buttonText.okay} color="#0E76FD" handler={handleClosePost} />
      </div>
    </Modal>
  );
};
