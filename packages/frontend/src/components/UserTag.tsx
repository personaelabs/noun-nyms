import Image from 'next/image';

interface UserTagProps {
  imgURL?: string;
  userId: string;
  date: string;
}

export const UserTag = (props: UserTagProps) => {
  const { imgURL, userId, date } = props;

  return (
    <div className="flex gap-2 items-center">
      <div className="flex gap-2 justify-center items-center">
        <Image alt={'profile'} src={imgURL ? imgURL : '/anon-noun.png'} width={30} height={30} />
        <strong>{userId}</strong>
      </div>
      <p className="secondary">-</p>
      <p className="secondary">{date}</p>
    </div>
  );
};
