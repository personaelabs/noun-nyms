import useUserInfo from '@/hooks/useUserInfo';
import ConnectWallet from '../ConnectWallet';
import { Modal } from './Modal';
import { useAccount } from 'wagmi';
import { useState } from 'react';

export const ValidUserWarning = () => {
  const { address } = useAccount();
  const { isValid } = useUserInfo({ address: address });
  const [showWarning, setShowWarning] = useState<boolean>(!isValid);

  return (
    <>
      {isValid || !showWarning ? null : (
        <Modal width="50%" handleClose={() => setShowWarning(false)}>
          <div className="flex flex-col gap-4 py-8 px-12 md:px-12 md:py-10">
            <h3>The connected wallet is not valid.</h3>
            <p className="text-gray-700">
              If you want to post, comment, or upvote, you must connect a wallet that owns a noun or
              is part of a multi-sig that owns a noun. If your wallet recently became valid, allow
              24 hours to see the changes reflected.
            </p>
            <div className="flex justify-center">
              <ConnectWallet />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
