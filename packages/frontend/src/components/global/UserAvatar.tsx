import { getSeedFromHash } from '@/lib/avatar-utils';
import { NOUNS_AVATAR_RANGES } from '@/lib/constants';
import { ImageData, getNounData } from '@nouns/assets';
import { PNGCollectionEncoder, buildSVG } from '@nouns/sdk';
import { useEffect, useMemo, useRef } from 'react';

const encoder = new PNGCollectionEncoder(ImageData.palette);

interface UserAvatarProps {
  userId: string;
  width: number;
}

export const UserAvatar = (props: UserAvatarProps) => {
  const { userId, width } = props;
  const svgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scaleSVG = () => {
      if (svgRef.current) {
        const svgElement = svgRef.current.children[0];

        svgElement.setAttribute('width', width.toString());
        svgElement.setAttribute('height', width.toString());
      }
    };
    scaleSVG();
  });

  const avatar = useMemo(() => {
    const seedFromUserId = getSeedFromHash(userId, 5, NOUNS_AVATAR_RANGES);
    const { parts, background } = getNounData(seedFromUserId);
    const svg = buildSVG(parts, encoder.data.palette, background);

    return svg;
  }, [userId]);
  return (
    <div
      className="shrink-0"
      style={{ borderRadius: '50%', overflow: 'hidden', width: width, height: width }}
      ref={svgRef}
      dangerouslySetInnerHTML={{ __html: avatar }}
    />
  );
};
