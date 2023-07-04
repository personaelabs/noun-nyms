import { UserContext } from '@/pages/_app';
import { MainButton } from '../MainButton';
import { useContext } from 'react';
import { UserContextType } from '@/types/components';
import { errorPage as TEXT } from '@/lib/text';
import Image from 'next/image';
import nouners from '../../../public/nouns.png';

interface ErrorPageProps {
  title: string;
  subtitle: string;
}
export const ErrorPage = (props: ErrorPageProps) => {
  const { title, subtitle } = props;
  const { pushRoute } = useContext(UserContext) as UserContextType;
  return (
    <main className="h-screen flex flex-col justify-end items-center">
      <div className="grow flex flex-col gap-4 justify-center items-center">
        <div className="flex flex-col gap-1 items-center">
          <h1 className="text-black">{title}</h1>
          <h4>{subtitle}</h4>
        </div>
        <MainButton message={TEXT.returnHome} handler={() => pushRoute('/')} />
      </div>
      <Image width={100} src={nouners} alt="nouns" />
    </main>
  );
};
