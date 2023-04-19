import dayjs from "dayjs";
import * as React from "react";
import { MessageModal } from "./MessageModal";
const relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);

interface ICommentViewProps {
    commentId: string;
    message: string;
    createdAt: Date;
    tagName: string;
    profileImgURL: string;
    proof: string;
}

export const CommentView = ({ message, proof, createdAt, tagName, profileImgURL, commentId }: ICommentViewProps) => {
    const [isOpen, setIsOpen] = React.useState(false);
    // TODO: after we add wagmi
    //  const { address } = useAccount();

    const openModal = () => {
        setIsOpen(true);
    };

    // TODO figure out how to pass in the comments
    const dateFromDescription = React.useMemo(() => {
        const date = dayjs(createdAt);
        // Dayjs doesn't have typings on relative packages so we have to do this
        // @ts-ignore
        return date.fromNow();
    }, [createdAt]);

    return (
        <>
            <MessageModal
                title={message}
                commentId={commentId}
                isOpen={isOpen}
                handleClose={(e) => {
                    setIsOpen(false);
                }}
            />
            <div
                onClick={openModal}
                className="rounded-2xl transition-all shadow-sm bg-white p-3 md:px-5 md:py-4 flex flex-col gap-4 justify-between border border-gray-200 hover:border-gray-300 hover:cursor-pointer w-full"
            >
                <div className="text-lg md:text-xl font-bold self-start line-clamp-2">
                    <span className="text-black tracking-tight font-bold">{message}</span>
                </div>
                <span>{message}</span>
                <div className="flex justify-between items-center">
                    <div className="flex justify-center items-center">
                        <p className="font-bold">{tagName}</p>
                        <div className="px-2"></div>
                        <p>{dateFromDescription}</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <p>43 replies</p>
                        <div className="px-2"></div>
                        <p>2212 views</p>
                    </div>
                </div>
            </div>
        </>
    );
};
