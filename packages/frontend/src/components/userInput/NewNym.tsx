import Image from 'next/image';
import { Modal } from '../global/Modal';
import { useState } from 'react';
import { MainButton } from '../MainButton';

interface NewNymProps {
  isOpen: boolean;
  handleClose: (isOpen: boolean) => void;
}

export const NewNym = (props: NewNymProps) => {
  const { isOpen, handleClose } = props;

  const confirmNewNym = () => console.log('confirm new nym');

  const [nymName, setNymName] = useState<string>('');
  return (
    <Modal width="50%" isOpen={isOpen} handleClose={handleClose}>
      <div className="flex flex-col gap-4 py-8 px-12 md:px-12 md:py-10">
        <div className="flex justify-start">
          <h3>Create a new nym</h3>
        </div>
        <p className="text-gray-700">
          What does it mean to create a new nym? Any warnings the user should know beforehand?
        </p>
        <div className="flex justify-start gap-2">
          <Image alt={'profile'} src={'/anon-noun.png'} width={20} height={20} />
          <div className="w-40 relative border border-gray-200 rounded-md px-4 py-2.5">
            <input
              type="text"
              placeholder="Name"
              value={nymName}
              onChange={(event) => setNymName(event.target.value)}
            />
          </div>
          <p className="secondary">#0000</p>
        </div>
        <div className="flex justify-center">
          <MainButton color="#0E76FD" message="Confirm" loading={false} handler={confirmNewNym} />
        </div>
      </div>
    </Modal>
  );
};
