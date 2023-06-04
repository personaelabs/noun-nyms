import { ErrorPage } from '@/components/global/ErrorPage';

export default function Custom500() {
  return <ErrorPage title={'500'} subtitle={'Internal Server Error'} />;
}
