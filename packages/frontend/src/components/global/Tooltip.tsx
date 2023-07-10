import { ReactNode, RefObject, useEffect, useState } from 'react';
import { calcNodeDistFromRight, calcDistFromRight } from '@/lib/client-utils';

interface Position {
  top: number | undefined;
  left: number | undefined;
}

interface TooltipProps {
  // reference element to calculate tooltip offset positioning
  refElem?: RefObject<HTMLElement>;
  // initial tooltip position without overflow offset
  initPosition?: Position;
  maxWidth: number;
  children: ReactNode;
}

const OFFSET_PADDING = 5;

export const Tooltip = (props: TooltipProps) => {
  const { refElem, initPosition, maxWidth, children } = props;
  const [position, setPosition] = useState<Position | null>(null);

  // calculate left offset to avoid tooltip overflow
  useEffect(() => {
    let offsetX,
      distFromRight = undefined;
    const initX = (initPosition && initPosition.left) || 0;

    // calculate distance from edge of viewport with initial position or reference node
    if (initPosition) distFromRight = calcDistFromRight(initX);
    else if (refElem && refElem.current) distFromRight = calcNodeDistFromRight(refElem.current);

    // assign left offset if tooltip will overflow
    if (distFromRight && distFromRight < maxWidth)
      offsetX = initX - (maxWidth - distFromRight + OFFSET_PADDING);

    setPosition({
      left: offsetX || initX,
      // only assign top value if given (default is 100%)
      top: initPosition && initPosition.top,
    });
  }, [setPosition, maxWidth, refElem, initPosition]);

  return (
    position && (
      <div className="z-50 absolute top-full" style={{ top: position.top, left: position.left }}>
        {children}
      </div>
    )
  );
};
