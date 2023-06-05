import { MainButton } from '@/components/MainButton';
import { useRouter } from 'next/router';

export default function Custom404() {
  const router = useRouter();

  return (
    <main className="h-screen flex flex-col justify-end items-center">
      <div className="grow flex flex-col gap-4 justify-center items-center">
        <div className="flex flex-col gap-1 items-center">
          <h1 className="text-black">404</h1>
          <h4>Page Not Found</h4>
        </div>
        <MainButton
          color={'#0e76fd'}
          message="Return Home"
          loading={false}
          handler={() => router.push('/')}
        />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="w-80" src="/nouns.png" alt="nouns" />
    </main>
  );
}
