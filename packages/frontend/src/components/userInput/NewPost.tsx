import { Dialog } from '@headlessui/react';
import { CommentWriter } from './CommentWriter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

interface NewPostProps {
  isOpen: boolean;
  handleClose: (isOpen: boolean) => void;
}
export const NewPost = (props: NewPostProps) => {
  const { isOpen, handleClose } = props;

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center">
          <Dialog.Panel className="w-full max-w-3xl bg-gray-50 mx-8 rounded-md">
            <div className="flex justify-end sm:hidden p-4 cursor-pointer">
              <FontAwesomeIcon icon={faXmark} color="#98A2B3" onClick={handleClose as any} />
            </div>
            <div className="flex flex-col gap-4 py-8 px-12 md:px-12 md:py-10">
              <div className="flex justify-between">
                <h3>Start a discussion here</h3>
                <div className="invisible sm:visible cursor-pointer">
                  <FontAwesomeIcon icon={faXmark} color="#98A2B3" onClick={handleClose as any} />
                </div>
              </div>
              <CommentWriter parentId={'0x0'} />
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};
