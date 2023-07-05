import { replaceHashNumberWithLink } from '@/lib/client-utils';
import ReactMarkdown from 'react-markdown';
import { useProposals } from '@/hooks/useProposals';

export const BodyWithPropLink = ({ body }: { body: string }) => {
  const { proposals } = useProposals();
  return (
    <>
      {proposals && (
        <ReactMarkdown className="propLink">
          {replaceHashNumberWithLink(body, proposals)}
        </ReactMarkdown>
      )}
    </>
  );
};
