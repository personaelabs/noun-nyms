import dayjs from "dayjs";
import * as React from "react";
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
    // TODO figure out how to pass in the comments
    const dateFromDescription = React.useMemo(() => {
        const date = dayjs(createdAt);
        // Dayjs doesn't have typings on relative packages so we have to do this
        // @ts-ignore
        return date.fromNow();
    }, [createdAt]);

    return (
        <div className="bg-white rounded-md shadow-sm max-w-xl mx-auto py-4 px-5 border border-gray-200">
            <div className="flex justify-between">
                <div className="flex items-center space-x-2">
                    <img className="inline-block h-8 w-8 rounded-full" src={profileImgURL} alt="" />
                    <p className="text-gray-800 font-semibold">{tagName}</p>
                    <p className="text-gray-500 font-normal">{dateFromDescription}</p>
                </div>
            </div>
            <p className="mt-3">{message}</p>
        </div>
    );
};
