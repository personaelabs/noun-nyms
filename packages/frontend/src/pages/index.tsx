import Posts from '@/components/Posts';
import { ErrorBoundary } from 'react-error-boundary';

export default function Home() {
  return (
    <ErrorBoundary fallback={<div>Top level error</div>}>
      <Posts />
    </ErrorBoundary>
  );
}
