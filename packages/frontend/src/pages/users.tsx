import { RetryError } from '@/components/global/RetryError';
import { Header } from '@/components/Header';
import Spinner from '@/components/global/Spinner';
import { UserTag } from '@/components/post/UserTag';
import useError from '@/hooks/useError';
import { UserPostCounts } from '@/types/api';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useContext, useMemo, useState } from 'react';
import { Filters } from '@/components/post/Filters';
import { SortSelect } from '@/components/post/SortSelect';
import { UserContext } from './_app';
import { UserContextType } from '@/types/components';

const getUsers = async () => (await axios.get<UserPostCounts[]>('/api/v1/users')).data;

const filterOptions: { [key: string]: string } = {
  all: 'All',
  doxed: 'Doxed',
  pseudo: 'Pseudo',
};

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

const filterUsers = (users: UserPostCounts[] | undefined, filter: string, searchQuery: string) => {
  let searchResult = searchQuery ? filterBySearch(users, searchQuery) : users;
  if (filter === 'all') return searchQuery ? filterBySearch(searchResult, searchQuery) : users;
  else return searchResult?.filter((u) => u.doxed === (filter === 'doxed'));
};

const sortUsers = (users: UserPostCounts[] | undefined, query: string) => {
  const queryString = query as keyof UserPostCounts;
  return users
    ? users.sort((a, b) => {
        if (queryString === 'lastActive') {
          const val1 = b['lastActive'] || new Date();
          const val2 = a['lastActive'] || new Date();

          return Number(new Date(val1)) - Number(new Date(val2));
        }
        return Number(b[queryString]) - Number(a[queryString]);
      })
    : users;
};

export default function Users() {
  const { errorMsg, setError } = useError();
  const {
    isLoading,
    refetch,
    isError,
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

  const { pushRoute } = useContext(UserContext) as UserContextType;
  const [filter, setFilter] = useState<string>('all');
  const [sort, setSort] = useState<string>('lastActive');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const filteredUsers = useMemo(
    () => filterUsers(users, filter, searchQuery),
    [filter, users, searchQuery],
  );
  const sortedUsers = useMemo(() => sortUsers(filteredUsers, sort), [filteredUsers, sort]);

  return (
    <main>
      <Header />
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
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <Filters
                    filters={filterOptions}
                    selectedFilter={filter}
                    setSelectedFilter={setFilter}
                  />
                  <div className="flex gap-1 items-center">
                    <p className="text-gray-500">Sort by</p>
                    <SortSelect
                      options={sortOptions}
                      selectedQuery={sort}
                      setSelectedQuery={setSort}
                    />
                  </div>
                </div>
                {sortedUsers && sortedUsers.length > 0 ? (
                  sortedUsers.map((u) => (
                    <div
                      className="flex gap-4 justify-between outline-none rounded-2xl transition-all shadow-sm bg-white p-3 md:px-5 md:py-4 border border-gray-200 hover:border-gray-300 hover:cursor-pointer w-full"
                      key={u.userId}
                      onClick={() => pushRoute(`/users/${u.userId}`)}
                    >
                      <div className="min-w-0 hover:no-underline">
                        <UserTag
                          hideLink={true}
                          avatarWidth={50}
                          userId={u.userId}
                          lastActive={u.lastActive}
                        />
                      </div>
                      <div className="flex gap-2 sm:gap-4 text-center">
                        <span className="my-auto">
                          <strong>{u.numPosts}</strong>
                          {u.numPosts === 1 ? ' Post' : ' Posts'}
                        </span>
                        <span className="my-auto">
                          <strong>{u.numReplies}</strong>
                          {u.numReplies === 1 ? ' Reply' : ' Replies'}
                        </span>
                        <span className="my-auto">
                          <strong>{u.upvotes}</strong>
                          {u.upvotes === 1 ? ' Vote' : ' Votes'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center">No Users Found</p>
                )}
              </>
            ) : isError ? (
              <RetryError
                message="Could not fetch users:"
                error={errorMsg}
                refetchHandler={refetch}
              />
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
