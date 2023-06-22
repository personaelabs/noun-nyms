import Posts from '@/components/Posts';
import Users from '@/components/Users';
import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { FAQ } from '@/components/FAQ';
import Image from 'next/image';
import nouners from '../../public/nouns.png';

export enum Views {
  POSTS = 'Discussion',
  USERS = 'Nyms',
}

interface HomeProps {
  defaultView?: Views;
  openPostId?: string;
}

export default function Home(props: HomeProps) {
  const { defaultView, openPostId } = props;
  const [view, setView] = useState(defaultView ? defaultView : Views.POSTS);

  const changeView = (v: Views) => {
    window.history.pushState(null, '', `${v === Views.USERS ? '/users' : '/'}`);
    setView(v);
  };

  return (
    <main className="flex justify-center w-full min-h-screen bg-gray-50">
      <div className="flex flex-col gap-4 w-full max-w-3xl px-4 md:px-0 py-3 md:py-6">
        <div className="w-full">
          <div className="grow flex justify-center">
            <Image src={nouners} alt="nouns" width={100} />
          </div>
          <div className="flex justify-center">
            <Tab.Group
              as={'div'}
              defaultIndex={Object.values(Views).indexOf(view)}
              className="bg-white rounded-full border border-gray-200 p-1"
            >
              <Tab.List>
                {Object.values(Views).map((v) => (
                  <Tab key={v} onClick={() => changeView(v)}>
                    {({ selected }) => (
                      <p
                        className={`py-1 px-3 rounded-full ${
                          selected ? 'bg-gray-100 font-semibold' : 'bg-white'
                        }`}
                      >
                        {v}
                      </p>
                    )}
                  </Tab>
                ))}
              </Tab.List>
            </Tab.Group>
          </div>
        </div>
        <div className="flex flex-col w-full gap-4 md:gap-8">
          {view === Views.POSTS ? <Posts initOpenPostId={openPostId} /> : <Users />}
        </div>
        <FAQ />
      </div>
    </main>
  );
}
