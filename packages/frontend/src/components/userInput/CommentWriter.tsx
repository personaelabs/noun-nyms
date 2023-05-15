import { Textarea } from './Textarea';
import { useState, useMemo } from 'react';
import Spinner from '../global/Spinner';
import { MainButton } from '../MainButton';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { postDoxed } from '../example/PostMessage';
import { useSignTypedData } from 'wagmi';
import { PrefixedHex } from '@personaelabs/nymjs';

interface IWriterProps {
  parentId: PrefixedHex;
}

export const CommentWriter = ({ parentId }: IWriterProps) => {
  //TODO: render title box if no commentId exists (distinguish between reply and top-level post)
  const [body, setCommentMsg] = useState<string>('');
  const [title, setTitleMsg] = useState<string>('');

  // TODO
  const someDbQuery = useMemo(() => true, []);

  // TODO
  const canPost = useMemo(() => true, []);

  const { signTypedDataAsync } = useSignTypedData();

  const sendPost = () => {
    console.log(`posting`, title, body);
    postDoxed({ title, body, parentId }, signTypedDataAsync);
  };

  return (
    <>
      {someDbQuery === undefined ? (
        <div className="bg-gray-100 border border-gray-300 p-12 py-24 rounded-md flex justify-center text-gray-800">
          <Spinner />
        </div>
      ) : canPost ? (
        <div className="w-full flex flex-col gap-6 justify-center items-center">
          <div className="w-full flex flex-col gap-4">
            {parentId === '0x0' ? (
              <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-clip w-full">
                <Textarea
                  value={title}
                  placeholder="Add title"
                  minHeight={50}
                  onChangeHandler={(newVal) => setTitleMsg(newVal)}
                ></Textarea>
              </div>
            ) : null}
            <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-clip w-full">
              <Textarea
                value={body}
                placeholder={parentId === '0x0' ? 'Description' : 'Type your comment here'}
                minHeight={100}
                onChangeHandler={(newVal) => setCommentMsg(newVal)}
              ></Textarea>
            </div>
          </div>

          {/* //TODO with nym selection */}
          <div className="w-full flex gap-2 items-center justify-end text-gray-500">
            <p className="secondary">Posting as</p>
            <div className="bg-white flex gap-2 border items-center border-gray-200 rounded-xl px-2 py-2.5 cursor-pointer">
              <Image alt={'profile'} src={'/anon-noun.png'} width={20} height={20} />
              <p className="secondary">Mr. Noun</p>
              <FontAwesomeIcon icon={faAngleDown} />
            </div>
            <MainButton color="black" handler={sendPost} loading={false} message={'Send'} />
          </div>
        </div>
      ) : null}
    </>
  );
};
