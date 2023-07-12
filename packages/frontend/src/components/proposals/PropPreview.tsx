import { type Proposal } from '@/hooks/useProposals';
import { Tooltip } from '../global/Tooltip';
import { PropStatusTag, Status } from './PropStatusTag';
import { RefObject } from 'react';

interface PropPreviewProps {
  prop: Proposal | null;
  linkRef: RefObject<HTMLElement>;
}

export const PropPreview = (props: PropPreviewProps) => {
  const { prop, linkRef } = props;

  return (
    prop && (
      <Tooltip maxWidth={250} maxHeight={150} refElem={linkRef.current} above={true}>
        <div className="flex flex-col gap-2 w-[250px] max-h-[150px] p-3 bg-white border border-gray-200 shadow-md rounded-xl">
          <div className="flex gap-2">
            <PropStatusTag status={prop.status as Status} />
            <p className="secondary text-gray-700 font-bold">
              {prop.title} <span className="font-normal">#{prop.id}</span>
            </p>
          </div>
        </div>
      </Tooltip>
    )
  );
};
