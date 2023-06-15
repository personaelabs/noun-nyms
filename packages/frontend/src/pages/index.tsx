import Posts from '@/components/Posts';
import Users from './users';
import { useState } from 'react';

enum Views {
  POSTS = 'Posts',
  USERS = 'Users',
}

export default function Home() {
  const [view, setView] = useState('Posts');
  return (
    <main className="flex w-full flex-col justify-center items-center">
      <div className="w-full bg-gray-50 flex flex-col justify-center items-center">
        <div className="bg-gray-50 min-h-screen w-full">
          <div className="w-full bg-gray-50 max-w-3xl mx-auto pt-2 md:pt-4 px-4 md:px-0">
            <div className="grow flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="w-[50px] md:w-[100px]" src="/nouns.png" alt="nouns" />
            </div>
            <select value={view} onChange={(e) => setView(e.target.value)}>
              <option value={Views.POSTS}>Discussion</option>
              <option value={Views.USERS}>Nyms</option>
            </select>
          </div>
          {view === Views.POSTS ? <Posts /> : <Users />}
        </div>
      </div>
    </main>
  );
}
