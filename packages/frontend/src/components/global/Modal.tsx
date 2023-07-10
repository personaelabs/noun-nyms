import { UserContext } from '@/pages/_app';
import { UserContextType } from '@/types/components';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog } from '@headlessui/react';
import { ReactNode, useContext } from 'react';
import { TransitionFade } from './TransitionFade';

interface ModalProps {
  width?: string;
  startAtTop?: boolean;
  isOpen: boolean;
  handleClose: () => void;
  children: ReactNode;
}

export const Modal = (props: ModalProps) => {
  const { width, startAtTop, isOpen, handleClose, children } = props;
  const { isMobile } = useContext(UserContext) as UserContextType;

  return (
    <TransitionFade show={isOpen}>
      <Dialog onClose={handleClose} className="relative z-50">
        {/* The backdrop, rendered as a fixed sibling to the panel container */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 overflow-y-auto">
          <div
            className="flex min-h-full justify-center"
            style={{ alignItems: startAtTop ? 'top' : isMobile ? 'end' : 'center' }}
          >
            <Dialog.Panel
              className="relative max-w-none md:max-w-3xl bg-gray-50 m-none md:mx-8 rounded-md rounded-b-none sm:rounded-b-md"
              style={{ width: width && !isMobile ? width : '100%' }}
            >
              <div className="flex flex-col gap-4 py-8 px-12 md:px-12 md:py-10">
                <div className="absolute p-6 top-0 right-0 cursor-pointer">
                  <FontAwesomeIcon
                    size={'xl'}
                    icon={faXmark}
                    className="text-gray-500"
                    onClick={handleClose as any}
                  />
                </div>
                {children}
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </TransitionFade>
  );
};
