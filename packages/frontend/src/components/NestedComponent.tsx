import { IComment } from '../lib/constants';
import * as React from 'react';
import dayjs from 'dayjs';
const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime);

interface INestedComponentProps {
  depth: number;
  commentId: string;
  title: string;
  message: string;
  createdAt: Date;
  tagName: string;
  innerComments: React.ReactNode;
  profileImgURL: string;
  proof: string;
  childrenLength: number;
}

export const resolveNestedComponentThreads = (allComments: IComment[], depth: number) => {
  const commentNodes: React.ReactNode[] = [];
  for (const comment of allComments) {
    commentNodes.push(
      <NestedComponent
        depth={depth}
        commentId={comment.commentId}
        title={comment.title}
        message={comment.message}
        createdAt={comment.createdAt}
        tagName={comment.tagName}
        innerComments={resolveNestedComponentThreads(comment.children, depth + 1)}
        profileImgURL={comment.profileImgURL}
        proof={comment.proof}
        childrenLength={comment.children.length}
      />,
    );
  }
  return commentNodes;
};

export const NestedComponent = ({
  depth,
  commentId,
  title,
  message,
  createdAt,
  tagName,
  innerComments,
  profileImgURL,
  proof,
  childrenLength,
}: INestedComponentProps) => {
  const dateFromDescription = React.useMemo(() => {
    const date = dayjs(createdAt);
    // Dayjs doesn't have typings on relative packages so we have to do this
    // @ts-ignore
    return date.fromNow();
  }, [createdAt]);

  return (
    <div key={commentId} style={{ marginLeft: `${depth * 20}px` }}>
      <div className="text-lg md:text-xl font-bold self-start line-clamp-2">
        <span className="text-black tracking-tight font-bold">{message}</span>
      </div>
      <span>{message}</span>
      <div className="flex justify-between items-center">
        <div className="flex justify-center items-center">
          <p className="font-bold">{tagName}</p>
          <div className="px-2"></div>
          <p style={{ color: 'gray' }}>{dateFromDescription}</p>
        </div>
        <div className="flex justify-between items-center">
          {/* // TODO fetch this info */}
          <p style={{ color: 'gray' }}>{childrenLength} replies</p>
          <div className="px-2"></div>
        </div>
      </div>
      {innerComments}
    </div>
  );
};
