import Image from 'next/image';
import { Modal } from './global/Modal';
import { MainButton } from './MainButton';

interface UpvoteWarningProps {
  isOpen: boolean;
  handleClose: () => void;
  upvoteHandler: () => void;
}

export const UpvoteWarning = (props: UpvoteWarningProps) => {
  const { isOpen, handleClose, upvoteHandler } = props;
  return (
    <Modal width="50%" isOpen={isOpen} handleClose={handleClose}>
      <div className="flex flex-col gap-4 py-8 px-12 md:px-12 md:py-10">
        <h3>You&apos;re voting as</h3>
        <div className="w-max flex gap-2 items-center rounded-xl px-2 py-2.5 border border-gray-200">
          <Image alt={'profile'} src={'/anon-noun.png'} width={24} height={24} />
          <p>Doxed User</p>
        </div>
        <p className="text-gray-700">
          Voting is currently only possible from a wallet, not a nym. Are you sure you want to vote
          with your wallet identity?
        </p>
        <div className="secondary">
          <p>Don&apos;t show this again</p>
        </div>
        <div className="flex justify-center">
          <MainButton color="#0E76FD" message="Vote" loading={false} handler={upvoteHandler} />
        </div>
      </div>
    </Modal>
  );
};
