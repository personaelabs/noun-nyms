import { Proposal } from '@/hooks/useProposals';
import { useState } from 'react';
import { TransitionFade } from '../global/TransitionFade';
import { PropStatusTag, Status } from './PropStatusTag';

interface PropLinkProps {
  string: string;
  proposal: Proposal;
}
export const PropLink = (props: PropLinkProps) => {
  const { string, proposal } = props;
  const { id, status, title } = proposal;

  const [showPreview, setShowPreview] = useState(false);

  return (
    <span className="relative w-full">
      <a
        className="relative underline font-bold text-blue"
        href={`https://nouns.wtf/vote/${id}`}
        key={id}
        onPointerEnter={() => setShowPreview(true)}
        onPointerLeave={() => setShowPreview(false)}
      >
        {string}
      </a>
      <TransitionFade duration={100} show={showPreview}>
        <div className="absolute bottom-full mb-2  left-1/2">
          <div className="flex flex-col w-[250px] px-4 py-2 bg-white border border-gray-200 shadow-md rounded-xl">
            <div className="flex gap-2">
              <PropStatusTag status={status as Status} />
              <p className="secondary text-gray-700 font-bold">
                {title} <span className="font-normal">#{id}</span>
              </p>
            </div>
          </div>
        </div>
      </TransitionFade>
    </span>
  );
};
