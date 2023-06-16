import Posts from '@/components/Posts';
import Users from '@/components/Users';
import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { FAQ } from '@/components/FAQ';
import Image from 'next/image';

export enum Views {
  POSTS = 'Discussion',
  USERS = 'Nyms',
}

interface HomeProps {
  defaultView?: Views;
}

export default function Home(props: HomeProps) {
  const { defaultView } = props;
  const [view, setView] = useState(defaultView ? defaultView : Views.POSTS);
  const [showFAQ, setShowFAQ] = useState(true);

  const changeView = (v: Views) => {
    window.history.pushState(null, '', `${v === Views.USERS ? '/users' : '/'}`);
    setView(v);
  };

  return (
    <main className="flex w-full flex-col justify-center items-center">
      <div className="w-full bg-gray-50 flex flex-col justify-center items-center">
        <div className="bg-gray-50 min-h-screen w-full">
          <div className="w-full bg-gray-50 max-w-3xl mx-auto pt-2 md:pt-4 px-4 md:px-0">
            <div className="grow flex justify-center">
              <Image height={100} width={100} src="/nouns.png" alt="nouns" />
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
          <div className="flex flex-col gap-8 max-w-3xl mx-auto py-3 md:py-6 px-4 md:px-0">
            {view === Views.POSTS ? <Posts /> : <Users />}
          </div>
          {showFAQ && <FAQ onHide={() => setShowFAQ(false)} />}
        </div>
      </div>
    </main>
  );
}
