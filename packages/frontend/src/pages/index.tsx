import Posts from '@/components/Posts';
import { IPostPreview } from '@/types/api';
import { ErrorBoundary } from 'react-error-boundary';
import { selectAndCleanPosts } from './api/v1/utils';

export async function getStaticProps(): Promise<{ props: { posts: IPostPreview[] | null } }> {
  const posts = await selectAndCleanPosts(undefined, 0, 10);
  return { props: { posts: JSON.parse(JSON.stringify(posts)) } };
}

export default function Home({ posts }: { posts?: IPostPreview[] }) {
  return (
    <ErrorBoundary fallback={<div>Top level error</div>}>
      <Posts posts={posts} />
    </ErrorBoundary>
  );
}
