import { ReactNode, RefObject, useEffect, useState } from 'react';
import { calculateNodeDistanceFromRight } from '@/lib/client-utils';

interface TooltipProps {
  refElem: RefObject<HTMLElement>;
  maxWidth: number;
  children: ReactNode;
}

interface Position {
  top: number | undefined;
  left: number | undefined;
}
export const Tooltip = (props: TooltipProps) => {
  const { refElem, maxWidth, children } = props;
  const [position, setPosition] = useState<Position | null>(null);

  useEffect(() => {
    let offsetLeft,
      offsetTop = undefined;
    if (refElem.current) {
      console.log('refElem exists!');
      const distFromRight = calculateNodeDistanceFromRight(refElem.current);
      console.log({ distFromRight });
      if (distFromRight < maxWidth) offsetLeft = -1 * (maxWidth - distFromRight);
    }
    setPosition({ left: offsetLeft, top: offsetTop });
  }, [setPosition, maxWidth, refElem]);

  return (
    position && (
      <div className="z-50 absolute top-full" style={{ top: position.top, left: position.left }}>
        {children}
      </div>
    )
  );
};
