import { Proposal } from '@/hooks/useProposals';

interface PropLinkProps {
  string: string;
  proposal: Proposal;
}
export const PropLink = (props: PropLinkProps) => {
  const { string, proposal } = props;
  const id = proposal.id;
  return (
    <a
      className="text-underline font-bold text-blue"
      href={`https://nouns.wtf/vote/${id}`}
      key={id}
    >
      {string}
    </a>
  );
};
