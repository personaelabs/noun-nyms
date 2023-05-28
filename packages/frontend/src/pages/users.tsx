import { RetryError } from '@/components/global/RetryError';
import { Header } from '@/components/Header';
import Spinner from '@/components/global/Spinner';
import { UserTag } from '@/components/post/UserTag';
import useError from '@/hooks/useError';
import { UserPostCounts } from '@/types/api';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useMemo, useState } from 'react';

const getUsers = async () => (await axios.get<UserPostCounts[]>('/api/v1/users')).data;

enum Filter {
  All = 'All',
  Doxed = 'Doxed',
  Pseudo = 'Pseudo',
}

const sortOptions: { [key: string]: string } = {
  lastActive: 'Last Active',
  numPosts: 'Posts',
  numReplies: 'Replies',
  upvotes: 'Votes',
};

const filterBySearch = (users: UserPostCounts[] | undefined, query: string) => {
  return users?.filter((u) => {
    const toSearch = u.name ? u.name.toLowerCase() : u.userId.toLowerCase();
    return toSearch.includes(query);
  });
};

const filterUsers = (users: UserPostCounts[] | undefined, filter: Filter, searchQuery: string) => {
  let searchResult = searchQuery ? filterBySearch(users, searchQuery) : users;
  if (filter === Filter.All) return searchQuery ? filterBySearch(searchResult, searchQuery) : users;
  else return searchResult?.filter((u) => u.doxed === (filter === Filter.Doxed));
};

const sortUsers = (users: UserPostCounts[] | undefined, query: string) => {
  const queryString = query as keyof UserPostCounts;
  return users
    ? users.sort((a, b) => {
        return (b[queryString] as number) - (a[queryString] as number);
      })
    : users;
};

export default function Users() {
  const { errorMsg, setError } = useError();
  const {
    isLoading,
    isError,
    refetch,
    data: users,
  } = useQuery<UserPostCounts[]>({
    queryKey: ['users'],
    queryFn: getUsers,
    retry: 1,
    enabled: true,
    staleTime: 1000,
    onError: (error) => {
      setError(error);
    },
  });

  const [filter, setFilter] = useState<Filter>(Filter.All);
  const [sort, setSort] = useState<string>(sortOptions.lastActive);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const filteredUsers = useMemo(
    () => filterUsers(users, filter, searchQuery),
    [filter, users, searchQuery],
  );

  const sortedUsers = useMemo(() => sortUsers(filteredUsers, sort), [filteredUsers, sort]);

  return (
    <main>
      <h1>Users</h1>
      <br></br>
      <Header />
      <main>
        <div className="w-full bg-gray-50 flex flex-col justify-center items-center">
          <div className="bg-gray-50 min-h-screen w-full">
            <div className="flex flex-col gap-8 max-w-3xl mx-auto py-5 md:py-10 px-3 md:px-0">
              <div className="flex justify-between">
                <h3>Users</h3>
                <input
                  className="outline-none bg-white px-2"
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    filterBySearch(filteredUsers, searchQuery);
                  }}
                />
              </div>
              {isLoading ? (
                <Spinner />
              ) : users && filteredUsers ? (
                <>
                  <div className="flex justify-between">
                    <div className="flex gap-4">
                      {Object.values(Filter).map((f) => (
                        <button
                          key={f}
                          className={`${
                            Filter[f] === filter ? 'bg-gray-200' : 'bg-transparent'
                          } hover:bg-gray-200 px-4 py-2 rounded-xl`}
                          onClick={() => setFilter(f)}
                        >
                          <p className="font-semibold text-gray-500">{f}</p>
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-1 items-center">
                      <p className="text-gray-500">Sort by</p>
                      <select
                        className="outline-none bg-transparent font-semibold"
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                      >
                        {Object.keys(sortOptions).map((s) => (
                          <option key={s} value={s}>
                            {sortOptions[s]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {sortedUsers && sortedUsers.length > 0 ? (
                    sortedUsers.map((u) => (
                      <a
                        href={`/users/${u.userId}`}
                        className="outline-none rounded-2xl transition-all shadow-sm bg-white p-3 md:px-5 md:py-4 flex gap-4 justify-between border border-gray-200 hover:border-gray-300 hover:cursor-pointer w-full"
                        key={u.userId}
                      >
                        <div className="hover:no-underline">
                          <UserTag
                            hideLink={true}
                            avatarWidth={50}
                            userId={u.userId}
                            lastActive={u.lastActive}
                          ></UserTag>
                        </div>
                        <div className="flex gap-4">
                          <span className="m-auto">
                            <strong>{u.numPosts}</strong>
                            {' Posts'}
                          </span>
                          <span className="m-auto">
                            <strong>{u.numReplies}</strong>
                            {' Replies'}
                          </span>
                          <span className="m-auto">
                            <strong>{u.upvotes}</strong>
                            {' Votes'}
                          </span>
                        </div>
                      </a>
                    ))
                  ) : (
                    <p className="text-center">No Users Found</p>
                  )}
                </>
              ) : (
                <RetryError
                  message="Could not fetch users."
                  error={errorMsg}
                  refetchHandler={refetch}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </main>
  );
}
