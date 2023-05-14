import { Textarea } from './Textarea';
import { useState, useMemo } from 'react';
import Spinner from './Spinner';
import { MainButton } from './MainButton';
import Image from 'next/image';

interface IWriterProps {
  commentId: string;
}

export const CommentWriter = ({ commentId }: IWriterProps) => {
  //TODO: render title box if no commentId exists (distinguish between reply and top-level post)
  const [commentMsg, setCommentMsg] = useState<string>('');
  const [titleMsg, setTitleMsg] = useState<string>('');

  // TODO
  const someDbQuery = useMemo(() => true, []);

  // TODO
  const canPost = useMemo(() => true, []);

  return (
    <>
      {someDbQuery === undefined ? (
        <div className="bg-gray-100 border border-gray-300 p-12 py-24 rounded-md flex justify-center text-gray-800">
          <Spinner />
        </div>
      ) : canPost ? (
        <div className="w-full flex flex-col gap-6 justify-center items-center">
          <div className="w-full flex flex-col gap-4">
            {commentId === 'new' ? (
              <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-clip w-full">
                <Textarea
                  value={titleMsg}
                  placeholder="Add title"
                  minHeight={50}
                  onChangeHandler={(newVal) => setTitleMsg(newVal)}
                ></Textarea>
              </div>
            ) : null}
            <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-clip w-full">
              <Textarea
                value={commentMsg}
                placeholder={commentId === 'new' ? 'Description' : 'Type your comment here'}
                minHeight={100}
                onChangeHandler={(newVal) => setCommentMsg(newVal)}
              ></Textarea>
            </div>
          </div>

          {/* //TODO with nym selection */}
          <div className="w-full flex gap-2 items-center justify-end text-gray-500">
            <p>Posting as</p>
            <div className="bg-white flex gap-1.5 border items-center border-gray-200 rounded-xl px-2 py-2.5">
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
      ) : null}
    </>
  );
};
