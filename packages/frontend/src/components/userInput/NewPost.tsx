import { PostWriter } from './PostWriter';
import { Modal } from '../global/Modal';
import { useState } from 'react';

interface NewPostProps {
  handleClose: (prog?: string) => void;
  scrollToPost: (id: string) => Promise<void>;
}
export const NewPost = (props: NewPostProps) => {
  const { handleClose, scrollToPost } = props;
  const [postInProg, setPostInProg] = useState('');
  const handleData = (data: string) => setPostInProg(data);

  return (
    <Modal handleClose={() => handleClose(postInProg)}>
      <div className="flex flex-col gap-4 py-8 px-12 md:px-12 md:py-10">
        <div className="flex justify-start">
          <h3>Start a discussion here</h3>
        </div>
        <PostWriter
          parentId={'0x0'}
          scrollToPost={scrollToPost}
          handleCloseWriter={() => handleClose(postInProg)}
          onProgress={handleData}
        />
      </div>
    </Modal>
  );
};
