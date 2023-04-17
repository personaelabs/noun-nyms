import dayjs from "dayjs";
import * as React from "react";
import { MessageModal } from "./MessageModal";
const relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);

interface ICommentViewProps {
    message: string;
    createdAt: Date;
    tagName: string;
    profileImgURL: string;
    proof: string;
}

export const CommentView = ({ message, proof, createdAt, tagName, profileImgURL }: ICommentViewProps) => {
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
                description={prop.description}
                propId={prop.id}
                isOpen={isOpen}
                handleClose={(e) => {
                    setIsOpen(false);
                }}
            />
        </>
    );
};
