import ConnectWallet from './ConnectWallet';
import { Modal } from './global/Modal';
import { walletWarning as TEXT } from '@/lib/text';

interface WalletWarningProps {
  isOpen: boolean;
  handleClose: () => void;
  action: string;
}

export const WalletWarning = (props: WalletWarningProps) => {
  const { isOpen, handleClose, action } = props;

  return (
    <>
      <Modal isOpen={isOpen} width="60%" handleClose={handleClose}>
        <h3>
          {TEXT.title} {action}
        </h3>
        <p className="text-gray-700">{TEXT.body}</p>
        <div className="flex justify-center">
          <ConnectWallet />
        </div>
      </Modal>
    </>
  );
};
