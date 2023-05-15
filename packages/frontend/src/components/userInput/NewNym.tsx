import Image from 'next/image';
import { Modal } from '../global/Modal';
import { useState } from 'react';
import { MainButton } from '../MainButton';
import { NYM_CODE_TYPE, DOMAIN } from '@personaelabs/nymjs';
import { useSignTypedData } from 'wagmi';

interface NewNymProps {
  isOpen: boolean;
  handleClose: (isOpen: boolean) => void;
}

export const NewNym = (props: NewNymProps) => {
  const { isOpen, handleClose } = props;
  const [nymName, setNymName] = useState<string>('');

  const { data: nymSig, signTypedData: signNymCode } = useSignTypedData({
    primaryType: 'Nym',
    domain: DOMAIN,
    types: NYM_CODE_TYPE,
    message: {
      nymName,
    },
  });

  return (
    <Modal width="50%" isOpen={isOpen} handleClose={handleClose}>
      <div className="flex flex-col gap-4 py-8 px-12 md:px-12 md:py-10">
        <div className="flex justify-start">
          <h3>Create a new nym</h3>
        </div>
        <p className="text-gray-700">
          What does it mean to create a new nym? Any warnings the user should know beforehand?
        </p>
        <div className="flex justify-start items-center gap-2">
          <Image alt={'profile'} src={'/anon-noun.png'} width={24} height={24} />
          <div className="relative border border-gray-200 rounded-md px-2 py-1">
            <input
              className="outline-none bg-transparent"
              type="text"
              placeholder="Name"
              value={nymName}
              onChange={(event) => setNymName(event.target.value)}
            />
          </div>
          <p className="secondary">#0000</p>
        </div>
        <div className="flex justify-center">
          <MainButton
            color="#0E76FD"
            message="Confirm"
            loading={false}
            handler={signNymCode}
            disabled={nymName !== '' && !nymSig ? false : true}
          />
        </div>
      </div>
    </Modal>
  );
};
