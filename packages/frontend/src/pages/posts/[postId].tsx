import { useRouter } from 'next/router';
import Posts from '@/components/Posts';
import { GetServerSidePropsContext } from 'next';
import { IPostSimple } from '@/types/api/postSelectSimple';
import { getSimplePost } from '../api/v1/utils';
import { Seo, TITLE } from '@/components/global/Seo';
import { UserContext } from '../_app';
import { UserContextType } from '@/types/components';
import { PostWithReplies } from '@/components/post/PostWithReplies';
import { useContext, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { DiscardPostWarning } from '@/components/DiscardPostWarning';

// This function returns the IPostSimple post object as a prop to PostId
export async function getServerSideProps(
  context: GetServerSidePropsContext,
): Promise<{ props: { post: IPostSimple | null } }> {
  return getSimplePost(context);
}

const buildSeo = (post?: IPostSimple) => {
  let dateString = '';
  if (post) {
    dateString = new Date(post.timestamp).toLocaleString();
  }
  const name = post?.name || '';
  const description = `${post?.body}\n️${dateString}`;
  return { title: name, description };
};

export default function PostId({ post }: { post?: IPostSimple }) {
  const router = useRouter();
  const openPostId = router.query.postId as string;
  const { description } = buildSeo(post);
  const { isMobile, pushRoute } = useContext(UserContext) as UserContextType;
  const [postInProg, setPostInProg] = useState('');
  const [discardWarningOpen, setDiscardWarningOpen] = useState(false);
  const handlePostInProg = (post: string) => setPostInProg(post);

  return (
    <div className="flex flex-col h-screen">
      <Seo title={TITLE} description={description} />
      {openPostId &&
        (isMobile ? (
          <>
            {discardWarningOpen && (
              <DiscardPostWarning
                handleCloseWarning={() => setDiscardWarningOpen(false)}
                handleClosePost={() => {
                  pushRoute('/');
                  setDiscardWarningOpen(false);
                }}
              />
            )}
            <div
              className="flex pt-6 px-6 gap-1 items-center underline cursor-pointer"
              onClick={() => {
                if (postInProg) setDiscardWarningOpen(true);
                else pushRoute('/');
              }}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="secondary" />
              <p>All posts</p>
            </div>
            <PostWithReplies postId={openPostId} onData={handlePostInProg} />
          </>
        ) : (
          <Posts initOpenPostId={openPostId} />
        ))}
    </div>
  );
}
