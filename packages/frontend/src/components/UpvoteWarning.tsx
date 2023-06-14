import { Modal } from './global/Modal';
import { MainButton } from './MainButton';
import { useAccount } from 'wagmi';
import { UserName } from './global/UserName';
import { UserAvatar } from './global/UserAvatar';
import { NameType } from '@/types/components';
import text from '@/lib/text.json';

interface UpvoteWarningProps {
  handleClose: () => void;
  upvoteHandler: () => void;
  loadingUpvote: boolean;
}

export const UpvoteWarning = (props: UpvoteWarningProps) => {
  const { handleClose, upvoteHandler, loadingUpvote } = props;
  const TEXT = text.upvote.warning;

  const { address } = useAccount();

  return (
    <Modal width="60%" handleClose={handleClose}>
      <div className="flex flex-col gap-4 py-8 px-12 md:px-12 md:py-10">
        <h3>{TEXT.title}</h3>
        <div className="w-max flex gap-2 items-center rounded-xl px-2 py-2.5 border border-gray-200">
          <UserAvatar type={NameType.DOXED} userId={address as string} width={24} />
          <p className="breakText">
            <UserName userId={address as string} />
          </p>
        </div>
        <p className="text-gray-700">{TEXT.body}</p>
        <div className="flex justify-center">
          <MainButton
            color="#0E76FD"
            message={TEXT.buttonText}
            loading={loadingUpvote}
            handler={upvoteHandler}
          />
        </div>
      </div>
    </Modal>
  );
};
