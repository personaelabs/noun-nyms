import { UserContext } from '@/pages/_app';
import { MainButton } from '../MainButton';
import { useContext } from 'react';
import { UserContextType } from '@/types/components';

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
        <MainButton
          color={'#0e76fd'}
          message="Return Home"
          loading={false}
          handler={() => pushRoute('/')}
        />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="w-80" src="/nouns.png" alt="nouns" />
    </main>
  );
};
