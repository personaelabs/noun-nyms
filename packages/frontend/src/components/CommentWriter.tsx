import { Textarea } from './Textarea';
import * as React from 'react';
import Spinner from './Spinner';

interface IWriterProps {
  commentId: string;
}

export const CommentWriter = ({ commentId }: IWriterProps) => {
  const [commentMsg, setCommentMsg] = React.useState<string>('');
  const [loadingText, setLoadingText] = React.useState<string>('');

  // TODO
  const someDbQuery = React.useMemo(() => true, []);

  // TODO
  const canPost = React.useMemo(() => true, []);

  return (
    <div className="w-full">
      {someDbQuery === undefined ? (
        <div className="bg-gray-100 border border-gray-300 p-12 py-24 rounded-md flex justify-center text-gray-800">
          <Spinner />
        </div>
      ) : canPost ? (
        <div className="w-full flex justify-center items-center">
          <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-clip w-full">
            <div className="py-2 px-0 w-full">
              <Textarea
                value={commentMsg}
                placeholder="Add your comment..."
                onChangeHandler={(newVal) => setCommentMsg(newVal)}
              ></Textarea>
            </div>

            {/* //TODO with nym selection */}
            <div className="flex justify-end p-4">
              <button
                // TODO
                onClick={() => console.log('TODO')}
                className="bg-black transition-all hover:bg-slate-900 hover:scale-105 active:scale-100 text-white font-semibold rounded-md px-4 py-2 mt-4"
              >
                {loadingText ? (
                  <div className="mx-16 py-1">
                    <Spinner />
                  </div>
                ) : (
                  `Post Anonymously`
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
