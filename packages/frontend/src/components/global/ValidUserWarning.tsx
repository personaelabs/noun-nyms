import ConnectWallet from '../ConnectWallet';
import { Modal } from './Modal';
import { useAccount } from 'wagmi';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '@/pages/_app';
import { UserContextType } from '@/types/components';
import text from '@/lib/text.json';

export const ValidUserWarning = () => {
  const { address } = useAccount();
  const { isValid } = useContext(UserContext) as UserContextType;
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const TEXT = text.validUserWarning;

  // disable warning when account changes and then reset it once isValid changes
  useEffect(() => setShowWarning(false), [address]);
  useEffect(() => setShowWarning(!isValid), [isValid]);

  return (
    <>
      {isValid || !showWarning ? null : (
        <Modal width="60%" handleClose={() => setShowWarning(false)}>
          <div className="flex flex-col gap-4 py-8 px-12 md:px-12 md:py-10">
            <h3>{TEXT.title}</h3>
            <p className="text-gray-700">{TEXT.body}</p>
            <div className="flex justify-center">
              <ConnectWallet />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
