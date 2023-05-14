import { Dialog } from '@headlessui/react';
import { CommentWriter } from './CommentWriter';

export const NewPost = (props: any) => {
  const { isOpen, handleClose } = props;

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center">
          <Dialog.Panel className="w-full max-w-3xl bg-gray-50 mx-8 rounded-md">
            <div className="flex flex-col gap-4 w-full p-8">
              <h3>Start a discussion here</h3>
              <CommentWriter commentId={'new'} />
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};
