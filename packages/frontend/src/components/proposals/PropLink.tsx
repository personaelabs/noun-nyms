import { Proposal } from '@/hooks/useProposals';
import { useContext, useRef, useState } from 'react';
import { PropPreview } from './PropPreview';
import { TransitionFade } from '../global/TransitionFade';
import { UserContext } from '@/pages/_app';
import { UserContextType } from '@/types/components';

interface PropLinkProps {
  string: string;
  proposal: Proposal;
}
export const PropLink = (props: PropLinkProps) => {
  const { string, proposal } = props;
  const { isMobile } = useContext(UserContext) as UserContextType;
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
        onMouseEnter={() => {
          if (!isMobile) setShowPreview(true);
        }}
        onMouseLeave={() => {
          if (!isMobile) setShowPreview(false);
        }}
      >
        {string}
      </a>
      <TransitionFade duration={100} show={showPreview}>
        <PropPreview prop={proposal} linkRef={linkRef} />
      </TransitionFade>
    </div>
  );
};
