import { ErrorPage } from '@/components/global/ErrorPage';
import { error500 as TEXT } from '@/lib/text';

export default function Custom500() {
  return <ErrorPage title={TEXT.title} subtitle={TEXT.subtitle} />;
}
