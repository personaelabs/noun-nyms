import { ErrorPage } from '@/components/global/ErrorPage';
import text from '@/lib/text.json';

export default function Custom404() {
  const TEXT = text.error404;
  return <ErrorPage title={TEXT.title} subtitle={TEXT.subtitle} />;
}
