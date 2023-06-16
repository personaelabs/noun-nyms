import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FAQ as TEXT } from '@/lib/text';
import { Popover } from '@headlessui/react';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { useContext } from 'react';
import { UserContext } from '@/pages/_app';
import { UserContextType } from '@/types/components';

interface FAQProps {
  onHide: () => void;
}

export const FAQ = (props: FAQProps) => {
  const { onHide } = props;
  const { isMobile } = useContext(UserContext) as UserContextType;

  return (
    <div className="fixed bottom-6 right-6">
      <Popover className="relative">
        <Popover.Button className="flex gap-2 items-center bg-white rounded-full p-2 border border-gray-200 shadow-md hover:scale-105 active:scale-100 transition-all">
          <FontAwesomeIcon
            className="hoverIcon"
            icon={faXmark}
            size={'sm'}
            color={'#98A2B3'}
            onClick={(e) => {
              e.stopPropagation();
              onHide();
            }}
          />
          <p>What is this?</p>
        </Popover.Button>
        <Popover.Panel
          style={{ width: isMobile ? 'calc(100vw - 4rem)' : '24rem' }}
          className="flex flex-col gap-4 absolute -top-2 left-full -translate-x-full -translate-y-full bg-white p-4 border border-gray-200 shadow-md rounded-xl"
        >
          <p>
            <span className="font-bold">{TEXT.title} </span>
            <span>{TEXT.body}</span>
          </p>
          <div className="flex gap-2">
            <a href="https://github.com/personaelabs/nym">
              <FontAwesomeIcon icon={faGithub} size={'lg'} />
            </a>
          </div>
        </Popover.Panel>
      </Popover>
    </div>
  );
};
