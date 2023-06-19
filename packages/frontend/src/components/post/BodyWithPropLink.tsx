import { replaceHashNumberWithLink } from '@/lib/client-utils';
import ReactMarkdown from 'react-markdown';

export const BodyWithPropLink = ({ body }: { body: string }) => {
  return <ReactMarkdown>{replaceHashNumberWithLink(body)}</ReactMarkdown>;
};
