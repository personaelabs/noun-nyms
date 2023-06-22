import { Proposal } from '@/hooks/useProposals';
import { faCheck, faCheckDouble, faClock, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Menu } from '@headlessui/react';
import MenuItem from './MenuItem';
import { useRef } from 'react';

interface ProposalProps {
  position: { x: number; y: number };
  proposals: Proposal[] | undefined;
}

enum Status {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUCCEEDED = 'SUCCEEDED',
  QUEUED = 'QUEUED',
  EXECUTED = 'EXECUTED',
  CANCELLED = 'CANCELLED',
  DEFEATED = 'DEFEATED',
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case Status.PENDING: {
      return <div className="w-2 h-2 border border-green-800 rounded-full" />;
    }
    case Status.ACTIVE: {
      return <div className="w-2 h-2 bg-green-800 rounded-full" />;
    }
    case Status.SUCCEEDED: {
      return <FontAwesomeIcon icon={faCheck} />;
    }
    case Status.QUEUED: {
      return <FontAwesomeIcon icon={faClock} />;
    }
    case Status.EXECUTED: {
      return <FontAwesomeIcon icon={faCheckDouble} />;
    }
    case Status.CANCELLED: {
      return <div className="w-2 h-2 bg-red-700 rounded-full" />;
    }
    case Status.DEFEATED: {
      return <FontAwesomeIcon icon={faXmark} />;
    }
  }
};

export const Proposals = (props: ProposalProps) => {
  const { position, proposals } = props;
  const menuItemRef = useRef<HTMLButtonElement>(null);

  return (
    <Menu
      as={'div'}
      className="flex flex-col absolute bg-white rounded-xl max-w-[200px] border border-gray-100 shadow-md"
      style={{ top: position.y, left: position.x }}
    >
      {proposals &&
        proposals.map((p) => (
          <Menu.Item as={'div'} key={p.id}>
            {({ active }) => (
              <MenuItem ref={menuItemRef} active={active} handler={() => console.log('clicked')}>
                <>
                  <div className="shrink-0">{getStatusIcon(p.status)}</div>
                  <p>#{p.id}</p>
                  <p className="breakText font-semibold">{p.title}</p>
                </>
              </MenuItem>
            )}
          </Menu.Item>
        ))}
    </Menu>
  );
};
