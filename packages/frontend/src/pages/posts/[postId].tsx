import { useRouter } from 'next/router';
import Posts from '@/components/Posts';
import { GetServerSidePropsContext } from 'next';
import { IPostSimple } from '@/types/api/postSelectSimple';
import { getSimplePost } from '../api/v1/utils';
import { Seo, TITLE } from '@/components/global/Seo';
import { UserContext } from '../_app';
import { UserContextType } from '@/types/components';
import { PostWithReplies } from '@/components/post/PostWithReplies';
import { useContext } from 'react';

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
  const { isMobile } = useContext(UserContext) as UserContextType;
  return (
    <>
      <Seo title={TITLE} description={description} />
      {openPostId &&
        (isMobile ? (
          <PostWithReplies postId={openPostId} />
        ) : (
          <Posts initOpenPostId={openPostId} />
        ))}
    </>
  );
}
