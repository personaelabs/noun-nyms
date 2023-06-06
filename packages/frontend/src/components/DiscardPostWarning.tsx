import { MainButton } from './MainButton';
import { Modal } from './global/Modal';

interface DiscardPostWarningProps {
  handleClosePost: () => void;
  handleCloseWarning: () => void;
}

export const DiscardPostWarning = (props: DiscardPostWarningProps) => {
  const { handleCloseWarning, handleClosePost } = props;
  return (
    <Modal handleClose={handleCloseWarning} width={'50%'}>
      <div className="flex flex-col gap-4 py-8 px-12 md:px-12 md:py-10 items-center">
        <p>You have a comment in progress, are you sure you want to discard it?</p>

        <div className="flex gap-2">
          <MainButton message={'Cancel'} color="#000000" handler={handleCloseWarning} />
          <MainButton message={'Okay'} color="#0E76FD" handler={handleClosePost} />
        </div>
      </div>
    </Modal>
  );
};
