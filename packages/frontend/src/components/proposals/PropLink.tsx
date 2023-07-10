import { Proposal } from '@/hooks/useProposals';
import { useRef, useState } from 'react';
import { PropPreview } from './PropPreview';
import { TransitionFade } from '../global/TransitionFade';

interface PropLinkProps {
  string: string;
  proposal: Proposal;
}
export const PropLink = (props: PropLinkProps) => {
  const { string, proposal } = props;
  const link = `https://nouns.wtf/vote/${proposal.id}`;

  const linkRef = useRef<HTMLAnchorElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="inline-block relative">
      <a
        className="hover:underline font-bold text-blue"
        ref={linkRef}
        href={link}
        target="_blank"
        key={proposal.id}
        onMouseEnter={() => setShowPreview(true)}
        onMouseLeave={() => setShowPreview(false)}
      >
        {string}
      </a>
      <TransitionFade duration={100} show={showPreview}>
        <PropPreview prop={proposal} linkRef={linkRef} />
      </TransitionFade>
    </div>
  );
};
