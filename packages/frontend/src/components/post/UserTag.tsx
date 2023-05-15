import { createAvatar } from '@dicebear/core';
import { pixelArt } from '@dicebear/collection';
import { getNounData, getRandomNounSeed, ImageData } from '@nouns/assets';
import { buildSVG, PNGCollectionEncoder } from '@nouns/sdk';
import { useEffect, useMemo, useRef } from 'react';
import { getSeedFromHash } from '../../lib/avatar-utils';
import { NOUNS_AVATAR_RANGES } from '../../lib/constants';
import { useAccount, useEnsName } from 'wagmi';
import { isAddress } from 'viem';

interface UserTagProps {
  imgURL?: string;
  userId: string;
  date: string;
}

const encoder = new PNGCollectionEncoder(ImageData.palette);

export const UserTag = (props: UserTagProps) => {
  const { imgURL, userId, date } = props;
  const isDoxed = isAddress(userId);
  console.log({ isDoxed });

  const { address } = useAccount();
  const { data, isError, isLoading } = useEnsName({
    address,
    enabled: isDoxed,
  });

  const svgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scaleSVG = () => {
      if (svgRef.current) {
        const svgElement = svgRef.current.children[0];

        svgElement.setAttribute('width', '30');
        svgElement.setAttribute('height', '30');
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
    <div className="flex gap-2 items-center">
      <div className="flex gap-2 justify-center items-center">
        <div
          style={{ borderRadius: '50%', overflow: 'hidden' }}
          ref={svgRef}
          dangerouslySetInnerHTML={{ __html: avatar }}
        />
        {isDoxed ? (
          data ? (
            <p className="font-semibold">{data}</p>
          ) : (
            <p className="font-semibold">{userId}</p>
          )
        ) : (
          <p className="font-semibold">{userId.split('-')[0]}</p>
        )}
      </div>
      <p className="secondary">-</p>
      <p className="secondary">{date}</p>
    </div>
  );
};
