import { faAngleDown, faAngleUp, faCheck, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { useState } from 'react';
import { NewNym } from './NewNym';

interface NymSelectProps {}

export const NymSelect = (props: NymSelectProps) => {
  const [openSelect, setOpenSelect] = useState<boolean>(false);
  const [openNewNym, setOpenNewNym] = useState<boolean>(false);

  return (
    <>
      {openNewNym ? <NewNym isOpen={openNewNym} handleClose={() => setOpenNewNym(false)} /> : null}
      <p className="secondary">Posting as</p>
      <div className="relative">
        <div
          className="bg-white flex gap-2 border items-center border-gray-200 rounded-xl px-2 py-2.5 cursor-pointer"
          onClick={() => setOpenSelect(!openSelect)}
        >
          <Image alt={'profile'} src={'/anon-noun.png'} width={20} height={20} />
          <p>Mr. Noun</p>
          <FontAwesomeIcon icon={openSelect ? faAngleUp : faAngleDown} />
        </div>
        {openSelect ? (
          <div className="absolute top-full left-0 w-full bg-white mt-2 border items-center border-gray-200 rounded-xl cursor-pointer">
            <div className="flex gap-2 px-2 py-2.5 rounded-xl hover:bg-gray-100">
              <Image alt={'profile'} src={'/anon-noun.png'} width={20} height={20} />
              <p>Mr. Noun</p>
              <FontAwesomeIcon icon={faCheck} className="hidden" />
            </div>
            <div className="flex gap-2 px-2 py-2.5 rounded-xl hover:bg-gray-100">
              <Image alt={'profile'} src={'/anon-noun.png'} width={20} height={20} />
              <p>Mr. Noun</p>
              <FontAwesomeIcon icon={faCheck} className="hidden" />
            </div>
            <div
              className="items-center flex gap-2 px-2 py-2.5 rounded-xl hover:bg-gray-100"
              onClick={() => setOpenNewNym(true)}
            >
              <FontAwesomeIcon icon={faPlus} className="w-5" color={'#0E76FD'} />
              <p>New Nym</p>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};
