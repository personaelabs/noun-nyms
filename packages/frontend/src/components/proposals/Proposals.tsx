import { Proposal } from '@/hooks/useProposals';
import { Menu } from '@headlessui/react';
import MenuItem from '../userInput/MenuItem';
import { useEffect, useRef, useState } from 'react';
import { Tooltip } from '../global/Tooltip';
import { createPortal } from 'react-dom';
import { PropStatusTag, Status } from './PropStatusTag';

interface ProposalProps {
  position: { x: number; y: number };
  proposals: Proposal[] | undefined;
  handleBodyChange: (val: string) => void;
  focusedItem: Proposal | null;
}

export const Proposals = (props: ProposalProps) => {
  const { position, proposals, handleBodyChange, focusedItem } = props;
  const menuItemRef = useRef<HTMLButtonElement>(null);
  const WIDTH = 200;

  //content stores the document or the modal that contains the post content, used for positioning the tooltip
  const [content, setContent] = useState<HTMLElement | null>(null);
  const [scrollOffset, setScrollOffset] = useState<number | null>(null);

  useEffect(() => {
    setContent(document.getElementById('main_modal') || document.body);
    const viewWindow = document.getElementById('modal_window');
    setScrollOffset(viewWindow ? viewWindow.scrollTop : window.scrollY);
  }, [setContent, content]);

  return (
    <>
      {content &&
        scrollOffset !== null &&
        createPortal(
          <Tooltip
            initPosition={{
              top: position.y + scrollOffset - content.offsetTop,
              left: position.x - content.offsetLeft,
            }}
            maxWidth={WIDTH}
          >
            <Menu
              as={'div'}
              className="flex flex-col bg-white rounded-xl max-w-[200px] border border-gray-100 shadow-md"
            >
              {proposals &&
                proposals.map((p) => (
                  <Menu.Item key={p.id}>
                    <MenuItem
                      ref={menuItemRef}
                      active={p.id === focusedItem?.id}
                      handler={() => {
                        handleBodyChange(p.id);
                      }}
                    >
                      <>
                        <PropStatusTag status={p.status as Status} />
                        <p>#{p.id}</p>
                        <p className="breakText font-semibold">{p.title}</p>
                      </>
                    </MenuItem>
                  </Menu.Item>
                ))}
            </Menu>
          </Tooltip>,
          content,
        )}
    </>
  );
};
