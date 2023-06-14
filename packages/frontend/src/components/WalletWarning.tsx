import ConnectWallet from './ConnectWallet';
import { Modal } from './global/Modal';
import text from '@/lib/text.json';

interface WalletWarningProps {
  handleClose: () => void;
  action: string;
}

export const WalletWarning = (props: WalletWarningProps) => {
  const { handleClose, action } = props;
  const TEXT = text.walletWarning;

  return (
    <>
      <Modal width="60%" handleClose={handleClose}>
        <div className="flex flex-col gap-4 py-8 px-12 md:px-12 md:py-10">
          <h3>
            {TEXT.title} {action}
          </h3>
          <p className="text-gray-700">{TEXT.body}</p>
          <div className="flex justify-center">
            <ConnectWallet />
          </div>
        </div>
      </Modal>
    </>
  );
};
