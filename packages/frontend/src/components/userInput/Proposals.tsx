import { Proposal } from '@/hooks/useProposals';
import { Menu } from '@headlessui/react';
import MenuItem from './MenuItem';
import { useEffect, useRef } from 'react';

interface ProposalProps {
  position: { x: number; y: number };
  proposals: Proposal[] | undefined;
  handleBodyChange: (val: string) => void;
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

const getStatusColor = (status: string) => {
  if (status === Status.PENDING || status === Status.ACTIVE || status === Status.SUCCEEDED) {
    return 'bg-green-800';
  } else if (status === Status.EXECUTED) return 'bg-[#0E76FD]';
  else if (status === Status.CANCELLED || status === Status.DEFEATED) {
    return 'bg-red-700';
  } else return 'bg-gray-500';
};

export const Proposals = (props: ProposalProps) => {
  const { position, proposals, handleBodyChange } = props;
  const menuItemRef = useRef<HTMLButtonElement>(null);

  const focusMenuItem = () => {
    if (menuItemRef.current) {
      menuItemRef.current.focus();
    }
  };

  // manually focus menu first menu item when component is mounted
  // useEffect(() => {
  //   focusMenuItem();
  // });

  return (
    <div className="fixed top-0 left-0">
      <Menu
        as={'div'}
        className="flex flex-col absolute bg-white rounded-xl max-w-[200px] border border-gray-100 shadow-md z-50"
        style={{ top: position.y, left: position.x }}
      >
        <Menu.Items static={true}>
          {proposals &&
            proposals.map((p) => (
              <Menu.Item key={p.id}>
                {({ active }) => (
                  <MenuItem
                    ref={menuItemRef}
                    active={active}
                    handler={() => {
                      handleBodyChange(p.id);
                    }}
                  >
                    <>
                      <div
                        className={`shrink-0 text-white text-[8px] font-bold px-2 py-0 rounded-md ${getStatusColor(
                          p.status,
                        )}`}
                      >
                        {p.status}
                      </div>
                      <p>#{p.id}</p>
                      <p className="breakText font-semibold">{p.title}</p>
                    </>
                  </MenuItem>
                )}
              </Menu.Item>
            ))}
        </Menu.Items>
      </Menu>
    </div>
  );
};
