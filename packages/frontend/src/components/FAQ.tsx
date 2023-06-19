import { faQuestion, faQuestionCircle, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Popover } from '@headlessui/react';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { useContext } from 'react';
import { UserContext } from '@/pages/_app';
import { UserContextType } from '@/types/components';
import { Modal } from './global/Modal';
import { FAQContent } from './FAQContent';

interface FAQProps {
  onHide: () => void;
}

export const FAQ = (props: FAQProps) => {
  const { onHide } = props;
  const { isMobile } = useContext(UserContext) as UserContextType;

  return (
    <div className="fixed bottom-6 right-6">
      <Popover className="relative">
        {({ open, close }) => (
          <>
            <Popover.Button className="flex gap-2 items-center bg-white rounded-full p-2 border border-gray-200 shadow-md hover:scale-105 active:scale-100 transition-all">
              {/* <FontAwesomeIcon
                className="hoverIcon"
                icon={faXmark}
                size={'sm'}
                color={'#98A2B3'}
                onClick={(e) => {
                  e.stopPropagation();
                  onHide();
                }}
              /> */}
              {isMobile ? (
                <div className="w-4 h-4 flex items-center justify-center">
                  <FontAwesomeIcon icon={faQuestion} />
                </div>
              ) : (
                <p>What is this?</p>
              )}
            </Popover.Button>
            {isMobile && open && (
              <Modal handleClose={close}>
                <FAQContent />
              </Modal>
            )}
            {!isMobile && (
              <Popover.Panel className="flex flex-col w-[24rem] gap-4 absolute -top-2 left-full -translate-x-full -translate-y-full bg-white p-4 border border-gray-200 shadow-md rounded-xl">
                <FAQContent />
              </Popover.Panel>
            )}
          </>
        )}
      </Popover>
    </div>
  );
};
