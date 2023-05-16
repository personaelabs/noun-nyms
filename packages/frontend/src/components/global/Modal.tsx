import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog } from '@headlessui/react';
import { ReactNode } from 'react';

interface ModalProps {
  width?: string;
  handleClose: () => void;
  children: ReactNode;
}

export const Modal = (props: ModalProps) => {
  const { width, handleClose, children } = props;
  return (
    <Dialog open={true} onClose={handleClose} className="relative z-50">
      {/* The backdrop, rendered as a fixed sibling to the panel container */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center">
          <Dialog.Panel
            className="relative max-w-3xl bg-gray-50 mx-8 rounded-md"
            style={{ width: width ? width : '100%' }}
          >
            <div className="absolute p-6 top-0 right-0 cursor-pointer">
              <FontAwesomeIcon icon={faXmark} color="#98A2B3" onClick={handleClose as any} />
            </div>
            {children}
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};
