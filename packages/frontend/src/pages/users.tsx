import { RetryError } from '@/components/global/RetryError';
import Spinner from '@/components/global/Spinner';
import { UserPostCounts } from '@/types/api';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';

const getUsers = async () => (await axios.get<UserPostCounts[]>('/api/v1/users')).data;

export default function Users() {
  const [errorMsg, setErrorMsg] = useState<string>('');
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
      if (error instanceof Error) {
        setErrorMsg(error.message);
      }
    },
  });

  console.log(users);
  return (
    <main>
      {users ? (
        <>
          <h1>Users</h1>
          <br></br>
          {users &&
            users.map((u) => (
              <div key={u.userId}>
                <p> Name: {u.name} </p>
                <p> Posts: {u.numPosts} </p>
                <p> Replies: {u.numReplies} </p>
                {u.upvotes && <p> Upvotes: {u.upvotes}</p>}
                {u.lastActive && <p>Last active: {new Date(u.lastActive).toLocaleString()}</p>}
                <br></br>
              </div>
            ))}
        </>
      ) : isLoading ? (
        <Spinner />
      ) : isError ? (
        <RetryError message="Could not get users." error={errorMsg} refetchHandler={refetch} />
      ) : null}
    </main>
  );
}
