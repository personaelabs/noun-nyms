import { createAvatar } from '@dicebear/core';
import { pixelArt } from '@dicebear/collection';
import { useMemo } from 'react';

interface UserTagProps {
  imgURL?: string;
  userId: string;
  date: string;
}

export const UserTag = (props: UserTagProps) => {
  const { imgURL, userId, date } = props;

  const avatar = useMemo(
    () =>
      createAvatar(pixelArt, {
        seed: userId,
        size: 30,
      }).toString(),
    [userId],
  );

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
