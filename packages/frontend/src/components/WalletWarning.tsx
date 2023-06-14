import ConnectWallet from './ConnectWallet';
import { Modal } from './global/Modal';

interface WalletWarningProps {
  handleClose: () => void;
  action: string;
}

export const WalletWarning = (props: WalletWarningProps) => {
  const { handleClose, action } = props;

  return (
    <>
      <Modal width="60%" handleClose={handleClose}>
        <div className="flex flex-col gap-4 py-8 px-12 md:px-12 md:py-10">
          <h3>Connect a valid wallet to {action}</h3>
          <p className="text-gray-700">
            If you want to post, reply, or upvote, you must connect a wallet that owns a noun or is
            part of a multi-sig that owns a noun. If your wallet recently became valid, allow 24
            hours to see the changes reflected.
          </p>
          <div className="flex justify-center">
            <ConnectWallet />
          </div>
        </div>
      </Modal>
    </>
  );
};
