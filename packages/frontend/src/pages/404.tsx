import { ErrorPage } from '@/components/global/ErrorPage';
import { error404 as TEXT } from '@/lib/text';

export default function Custom404() {
  return <ErrorPage title={TEXT.title} subtitle={TEXT.subtitle} />;
}
