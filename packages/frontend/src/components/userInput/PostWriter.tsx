import { Textarea } from './Textarea';
import { useState, useMemo } from 'react';
import Spinner from '../global/Spinner';
import { MainButton } from '../MainButton';
import { postDoxed, postPseudo } from '@/lib/actions';
import { useAccount, useSignTypedData } from 'wagmi';
import { PrefixedHex } from '@personaelabs/nymjs';
import { NymSelect } from './NymSelect';
import { ClientNym } from '@/types/components';

interface IWriterProps {
  parentId: PrefixedHex;
  setShowWriter?: (showWriter: boolean) => void;
}

export const PostWriter = ({ parentId, setShowWriter }: IWriterProps) => {
  //TODO: render title box if no postId exists (distinguish between reply and top-level post)
  const [body, setPostMsg] = useState<string>('');
  const [title, setTitleMsg] = useState<string>('');
  const [nym, setNym] = useState<ClientNym>({ nymSig: '0x0', nymName: 'Doxed' });

  // TODO
  const someDbQuery = useMemo(() => true, []);

  // TODO
  const canPost = useMemo(() => true, []);

  const { signTypedDataAsync } = useSignTypedData();

  const sendPost = async () => {
    if (nym.nymName === 'Doxed') {
      await postDoxed({ title, body, parentId }, signTypedDataAsync);
    } else {
      await postPseudo(nym.nymName, nym.nymSig, { title, body, parentId }, signTypedDataAsync);
    }
    if (setShowWriter) setShowWriter(false);
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
                placeholder={parentId === '0x0' ? 'Description' : 'Type your post here'}
                minHeight={100}
                onChangeHandler={(newVal) => setPostMsg(newVal)}
              ></Textarea>
            </div>
          </div>
          <div className="w-full flex gap-2 items-center justify-end text-gray-500">
            <NymSelect selectedNym={nym} setSelectedNym={setNym} />
            <MainButton color="black" handler={sendPost} loading={false} message={'Send'} />
          </div>
        </div>
      ) : null}
    </>
  );
};
