import { Dialog } from "@headlessui/react";
import * as React from "react";
import { CommentWriter } from "./CommentWriter";

interface IMessageModalProps {
    commentId: string;
    isOpen: boolean;
    handleClose: (isOpen: boolean) => void;
    title: string;
}

export const MessageModal = ({ isOpen, commentId, handleClose, title }: IMessageModalProps) => {
    return (
        <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
            {/* The backdrop, rendered as a fixed sibling to the panel container */}
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center">
                    <Dialog.Panel className="w-full max-w-5xl bg-white ">
                        <div className="flex justify-end sm:hidden">
                            <button
                                className="w-fit border font-bold bg-black border-black text-white rounded-full px-1.5"
                                onClick={handleClose as any}
                            >
                                X
                            </button>
                        </div>

                        <div>{title}</div>

                        <CommentWriter commentId={commentId} />
                    </Dialog.Panel>
                </div>
            </div>
        </Dialog>
    );
};
