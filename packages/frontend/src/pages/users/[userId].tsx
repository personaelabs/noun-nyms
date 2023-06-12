import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next';
import { IPostSimple } from '@/types/api/postSelectSimple';
import { getSimplePost } from '../api/v1/utils';
import { Seo } from '@/components/global/Seo';
import { UserContext } from '../_app';
import { UserContextType } from '@/types/components';
import { useContext, useState } from 'react';
import User from '@/components/User';

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

export default function UserId({ post }: { post?: IPostSimple }) {
  const router = useRouter();
  const userId = router.query.userId as string;
  const { title, description } = buildSeo(post);
  const { isMobile, postInProg, pushRoute } = useContext(UserContext) as UserContextType;
  const [discardWarningOpen, setDiscardWarningOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen">
      <Seo title={title} description={description} />
      {userId && <User />}
    </div>
  );
}
