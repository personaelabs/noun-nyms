import { ErrorPage } from '@/components/global/ErrorPage';
import text from '@/lib/text.json';

export default function Custom500() {
  const TEXT = text.error500;
  return <ErrorPage title={TEXT.title} subtitle={TEXT.subtitle} />;
}
