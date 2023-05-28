import { useRouter } from 'next/router';
import Posts from '@/components/Posts';
import { GetServerSidePropsContext } from 'next';
import { IPostSimple } from '@/types/api/postSelectSimple';
import { getSimplePost } from '../api/v1/utils';
import { Seo } from '@/components/global/Seo';

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
  const { title, description } = buildSeo(post);
  return (
    <>
      <Seo title={title} description={description} />
      {openPostId && <Posts initOpenPostId={openPostId} />}
    </>
  );
}
