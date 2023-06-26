import useName from '@/hooks/useName';
import { getSeedFromHash } from '@/lib/avatar-utils';
import { NOUNS_AVATAR_RANGES } from '@/lib/constants';
import { NameType } from '@/types/components';
import { ImageData, getNounData } from '@nouns/assets';
import { PNGCollectionEncoder, buildSVG } from '@nouns/sdk';
import Image from 'next/image';
import { useEffect, useMemo, useRef } from 'react';
import { useEnsAvatar } from 'wagmi';

const encoder = new PNGCollectionEncoder(ImageData.palette);

interface UserAvatarProps {
  type?: NameType;
  userId?: string;
  width: number;
}

export const UserAvatar = (props: UserAvatarProps) => {
  const { type, userId, width } = props;
  const svgRef = useRef<HTMLDivElement>(null);

  // If ens + avatar exists, return image
  const { name, isEns, isDoxed } = useName({ userId });

  const userType = type || isDoxed ? NameType.DOXED : NameType.PSEUDO;

  const strokeColor =
    userType === NameType.DOXED
      ? '#0E76FD'
      : userType === NameType.PSEUDO
      ? '#6B21A8'
      : 'transparent';

  useEffect(() => {
    const scaleSVG = () => {
      if (userId && svgRef.current) {
        const svgElement = svgRef.current.children[0];

        svgElement.setAttribute('width', width.toString());
        svgElement.setAttribute('height', width.toString());
      }
    };
    scaleSVG();
  });

  const avatar = useMemo(() => {
    if (userId) {
      const seedFromUserId = getSeedFromHash(userId, 5, NOUNS_AVATAR_RANGES);
      const { parts, background } = getNounData(seedFromUserId);
      const svg = buildSVG(parts, encoder.data.palette, background);

      return svg;
    }
    return undefined;
  }, [userId]);

  const { data: avatarUrl } = useEnsAvatar({
    name: name || `personaelabs.eth`,
    enabled: isEns,
  });

  return avatarUrl && isEns ? (
    <Image
      src={avatarUrl}
      alt="ENS Avatar"
      width={width + 4}
      height={width + 4}
      style={{ borderRadius: '50%', overflow: 'hidden', border: `2px solid ${strokeColor}` }}
      className="shrink-0"
    />
  ) : avatar ? (
    <div
      className="shrink-0"
      style={{
        borderRadius: '50%',
        overflow: 'hidden',
        width: width + 4,
        height: width + 4,
        border: `2px solid ${strokeColor}`,
      }}
      ref={svgRef}
      dangerouslySetInnerHTML={{ __html: avatar }}
    />
  ) : (
    <div
      className="shrink-0"
      style={{
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        width: width + 4,
        height: width + 4,
        border: `2px solid ${strokeColor}`,
      }}
    >
      <Image src={'/question.svg'} width={width - 8} height={width - 8} alt="question mark" />
    </div>
  );
};
