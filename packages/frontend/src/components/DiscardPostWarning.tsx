import { MainButton } from './MainButton';
import { Modal } from './global/Modal';
import text from '@/lib/text.json';

interface DiscardPostWarningProps {
  handleClosePost: () => void;
  handleCloseWarning: () => void;
}

export const DiscardPostWarning = (props: DiscardPostWarningProps) => {
  const { handleCloseWarning, handleClosePost } = props;
  const TEXT = text.discardPostWarning;
  return (
    <Modal handleClose={handleCloseWarning} width={'50%'}>
      <div className="flex flex-col gap-4 py-8 px-12 md:px-12 md:py-10 items-center">
        <p>{TEXT.body}</p>

        <div className="flex gap-2">
          <MainButton
            message={TEXT.buttonText.cancel}
            color="#000000"
            handler={handleCloseWarning}
          />
          <MainButton message={TEXT.buttonText.okay} color="#0E76FD" handler={handleClosePost} />
        </div>
      </div>
    </Modal>
  );
};
