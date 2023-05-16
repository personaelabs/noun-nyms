import ConnectWallet from './ConnectWallet';
import { Modal } from './global/Modal';

interface WalletWarningProps {
  isOpen: boolean;
  handleClose: () => void;
  action: string;
}

export const WalletWarning = (props: WalletWarningProps) => {
  const { isOpen, handleClose, action } = props;

  return (
    <Modal width="50%" isOpen={isOpen} handleClose={handleClose}>
      <div className="flex flex-col gap-4 py-8 px-12 md:px-12 md:py-10">
        <h3>Connect a wallet to {action}</h3>
        <p className="text-gray-700">
          Hey everyone, I was just reading about the challenges facing web3 adoption and I think one
          of the key issues is creating a more user-friendly ecosystem. What do you all think?
        </p>
        <div className="flex justify-center">
          <ConnectWallet />
        </div>
      </div>
    </Modal>
  );
};
