import { Dialog } from '@headlessui/react';
import * as React from 'react';
import { CommentWriter } from './CommentWriter';

interface IMessageModalProps {
  commentId: string;
  isOpen: boolean;
  handleClose: (isOpen: boolean) => void;
  title: string;
  message: string;
  tagName: string;
  dateFromDescription: string;
}

export const MessageModal = ({
  isOpen,
  commentId,
  handleClose,
  title,
  message,
  dateFromDescription,
  tagName,
}: IMessageModalProps) => {
  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      {/* The backdrop, rendered as a fixed sibling to the panel container */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center">
          <Dialog.Panel className="w-full max-w-5xl bg-white mx-8 rounded-md">
            <div className="flex justify-end sm:hidden">
              <button
                className="w-fit border font-bold bg-black border-black text-white rounded-full px-1.5"
                onClick={handleClose as any}
              >
                X
              </button>
            </div>

            <div className="py-8 px-12 md:px-12 md:py-10">
              <div className="flex justify-between item-center">
                <div className="text-lg md:text-xl font-bold self-start line-clamp-2">
                  <span className="text-black tracking-tight font-bold">{title}</span>
                </div>
                <button
                  style={{ color: 'gray' }}
                  className="w-fit font-bold focus:outline-0"
                  onClick={handleClose as any}
                >
                  X
                </button>
              </div>
              <div className="py-1"></div>
              <span>{message}</span>
              <div className="py-3"></div>
              <div className="flex justify-between items-center">
                <div className="flex justify-center items-center">
                  <p className="font-bold">{tagName}</p>
                  <div className="px-2"></div>
                  <p style={{ color: 'gray' }}>{dateFromDescription}</p>
                </div>
                <div className="flex justify-between items-center">
                  {/* // TODO fetch this info */}
                  <p style={{ color: 'gray' }}>43 replies</p>
                  <div className="px-2"></div>
                  <p style={{ color: 'gray' }}>2212 views</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col w-full bg-slate-100 px-12 py-8">
              <CommentWriter commentId={commentId} />
              <div className="py-8"></div>
              <p className="font-bold" style={{ color: 'gray' }}>
                32 comments
              </p>
              <div className="flex flex-col w-full justify-center iterms-center">
                {/* TODO: all comment threading */}
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};
