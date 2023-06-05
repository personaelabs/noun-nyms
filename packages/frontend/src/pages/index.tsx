import Posts from '@/components/Posts';
import { ErrorPage } from '@/components/global/ErrorPage';
import { ErrorBoundary } from 'react-error-boundary';

export default function Home() {
  return (
    <ErrorBoundary fallback={<ErrorPage title={'Uh Oh!'} subtitle={'Error Unknown'} />}>
      <Posts />
    </ErrorBoundary>
  );
}
