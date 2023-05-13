import { Textarea } from './Textarea';
import * as React from 'react';
import Spinner from './Spinner';
import { MainButton } from './MainButton';
import Image from 'next/image';

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
                placeholder="Type your comment here"
                onChangeHandler={(newVal) => setCommentMsg(newVal)}
              ></Textarea>
            </div>

            {/* //TODO with nym selection */}
            <div className="flex gap-2 items-center justify-end p-4 text-gray-500">
              <p>Posting as</p>
              <div className="flex gap-1.5 border items-center border-gray-200 rounded-xl px-2 py-2.5">
                <Image alt={'profile'} src={'/anon-noun.png'} width={30} height={30} />
                <p>Mr. Noun</p>
              </div>
              <MainButton
                color="black"
                handler={() => console.log('post anonymously')}
                loading={false}
                message={'Send'}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
