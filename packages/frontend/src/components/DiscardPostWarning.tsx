import { MainButton } from './MainButton';
import { Modal } from './global/Modal';
import { discardPostWarning as TEXT } from '@/lib/text';
import { BLACK } from '@/lib/colors';

interface DiscardPostWarningProps {
  isOpen: boolean;
  handleClosePost: () => void;
  handleCloseWarning: () => void;
}

export const DiscardPostWarning = (props: DiscardPostWarningProps) => {
  const { isOpen, handleCloseWarning, handleClosePost } = props;
  return (
    <Modal isOpen={isOpen} handleClose={handleCloseWarning} width={'50%'}>
      <p>{TEXT.body}</p>

      <div className="flex gap-2 justify-center">
        <MainButton message={TEXT.buttonText.cancel} color={BLACK} handler={handleCloseWarning} />
        <MainButton message={TEXT.buttonText.okay} handler={handleClosePost} />
      </div>
    </Modal>
  );
};
