import ConnectWallet from '../ConnectWallet';
import { Modal } from './Modal';
import { useAccount } from 'wagmi';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '@/pages/_app';
import { UserContextType } from '@/types/components';

export const ValidUserWarning = () => {
  const { address } = useAccount();
  const { isValid } = useContext(UserContext) as UserContextType;
  const [showWarning, setShowWarning] = useState<boolean>(!isValid);

  useEffect(() => setShowWarning(!isValid), [address, isValid]);

  return (
    <>
      {isValid || !showWarning ? null : (
        <Modal width="60%" handleClose={() => setShowWarning(false)}>
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
