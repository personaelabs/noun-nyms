import ConnectWallet from '../ConnectWallet';
import { Modal } from './Modal';
import { useAccount } from 'wagmi';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '@/pages/_app';
import { UserContextType } from '@/types/components';
import { validUserWarning as TEXT } from '@/lib/text';

export const ValidUserWarning = () => {
  const { address } = useAccount();
  const { isValid } = useContext(UserContext) as UserContextType;
  const [showWarning, setShowWarning] = useState(false);

  // disable warning when account changes and then reset it once isValid changes
  useEffect(() => setShowWarning(false), [address]);
  useEffect(() => setShowWarning(!isValid), [isValid, address]);

  return (
    <>
      {showWarning && (
        <Modal isOpen={showWarning} width="60%" handleClose={() => setShowWarning(false)}>
          <h3>{TEXT.title}</h3>
          <p className="text-gray-700">{TEXT.body}</p>
          <div className="flex justify-center">
            <ConnectWallet />
          </div>
        </Modal>
      )}
    </>
  );
};
