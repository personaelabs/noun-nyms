import { createAvatar } from '@dicebear/core';
import { pixelArt } from '@dicebear/collection';
import { getNounData, getRandomNounSeed, ImageData } from '@nouns/assets';
import { buildSVG, PNGCollectionEncoder } from '@nouns/sdk';
import { useMemo } from 'react';
import { getSeedFromHash } from '../../lib/avatar-utils';
import { NOUNS_AVATAR_RANGES } from '../../lib/constants';

interface UserTagProps {
  imgURL?: string;
  userId: string;
  date: string;
}

const encoder = new PNGCollectionEncoder(ImageData.palette);

export const UserTag = (props: UserTagProps) => {
  const { imgURL, userId, date } = props;

  const avatar = useMemo(() => {
    const seedFromUserId = getSeedFromHash(userId, 5, NOUNS_AVATAR_RANGES);
    const { parts, background } = getNounData(seedFromUserId);
    const svg = buildSVG(parts, encoder.data.palette, background);
    return svg;
  }, [userId]);

  return (
    <div className="flex gap-2 items-center">
      <div className="flex gap-2 justify-center items-center">
        <div dangerouslySetInnerHTML={{ __html: avatar }} />
        <p className="font-semibold">{userId}</p>
      </div>
      <p className="secondary">-</p>
      <p className="secondary">{date}</p>
    </div>
  );
};
