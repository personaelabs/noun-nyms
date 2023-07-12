import { ReactNode, useEffect, useState } from 'react';
import { calcNodeDistFromRight, calcDistFromRight, calcNodeDistFromTop } from '@/lib/client-utils';

interface Position {
  top: number | undefined;
  left: number | undefined;
}

interface TooltipProps {
  // reference element to calculate tooltip offset positioning
  refElem?: HTMLElement | null;
  // initial tooltip position without overflow offset
  initPosition?: Position;
  above?: boolean;
  maxWidth: number;
  maxHeight?: number;
  children: ReactNode;
}

const OFFSET_PADDING = 5;

export const Tooltip = (props: TooltipProps) => {
  const { refElem, initPosition, above = false, maxWidth, maxHeight = 0, children } = props;
  const [position, setPosition] = useState<Position | null>(null);
  const [renderAbove, setRenderAbove] = useState(above);

  // calculate left offset to avoid tooltip overflow
  useEffect(() => {
    let offsetX,
      distFromRight,
      distFromTop = undefined;
    const initX = (initPosition && initPosition.left) || 0;
    const initY = (initPosition && initPosition.top) || 0;

    // calculate distance from edge of viewport with initial position or reference node
    if (initPosition) {
      distFromRight = calcDistFromRight(initX);
      distFromTop = initY;
    } else if (refElem) {
      distFromRight = calcNodeDistFromRight(refElem);
      distFromTop = calcNodeDistFromTop(refElem);
    }

    // assign left offset if tooltip will overflow
    if (distFromRight && distFromRight < maxWidth)
      offsetX = initX - (maxWidth - distFromRight + OFFSET_PADDING);

    //render tooltip below ref if tooltip will overflow top
    if (distFromTop && distFromTop < maxHeight) setRenderAbove(false);

    setPosition({
      left: offsetX || initX,
      top: initPosition && initPosition.top,
    });
  }, [setPosition, maxWidth, maxHeight, refElem, initPosition]);

  return (
    position && (
      <div
        className={`z-50 absolute ${renderAbove ? 'mb-2' : 'mt-2'}`}
        style={{
          top: position.top || (renderAbove ? 'auto' : '100%'),
          bottom: renderAbove ? '100%' : 'auto',
          left: position.left,
        }}
      >
        {children}
      </div>
    )
  );
};
