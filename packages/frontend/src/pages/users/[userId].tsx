import { GetServerSidePropsContext } from 'next';
import { getSimpleUser } from '../api/v1/utils';
import { Seo } from '@/components/global/Seo';
import User from '@/components/User';
import { IUser } from '@/types/api';

// This function returns the IPostSimple post object as a prop to PostId
export async function getServerSideProps(
  context: GetServerSidePropsContext,
): Promise<{ props: { user: IUser | null } }> {
  return getSimpleUser(context);
}

const buildSeo = (user?: IUser) => {
  const name = user?.name || '';
  const numPosts = user?.totalPosts || 0;
  const upvotesReceived = user?.upvotesReceived || 0;
  const postDescription = `${numPosts} ${numPosts === 1 ? `post` : `posts`}`;
  const upvoteDescription = `️${upvotesReceived} ${
    upvotesReceived === 1 ? `upvote` : `upvotes`
  } received`;
  const description = `${postDescription}\n${upvoteDescription}`;
  return { title: name, description };
};

export default function UserId({ user }: { user?: IUser }) {
  const { title, description } = buildSeo(user);
  return (
    <div className="flex flex-col h-screen">
      <Seo ogTitle={title} ogDescription={description} />
      {user && <User userId={user.userId} />}
    </div>
  );
}
