import { RetryError } from '@/components/global/RetryError';
import Spinner from '@/components/global/Spinner';
import { UserTag } from '@/components/post/UserTag';
import useError from '@/hooks/useError';
import { UserPostCounts } from '@/types/api';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const getUsers = async () => (await axios.get<UserPostCounts[]>('/api/v1/users')).data;

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

  return (
    <main>
      <h1>Users</h1>
      <br></br>
      {isLoading && <Spinner />}
      {isError && (
        <RetryError message="Could not fetch users." error={errorMsg} refetchHandler={refetch} />
      )}
      {users &&
        users.map((u) => (
          <div key={u.userId}>
            <a href={`/users/${u.userId}`} className="hover:underline">
              <UserTag userId={u.userId}></UserTag>
            </a>
            <p> Posts: {u.numPosts} </p>
            <p> Replies: {u.numReplies} </p>
            <p> Upvotes Received: {u.upvotes}</p>
            {u.lastActive && <p>Last active: {new Date(u.lastActive).toLocaleString()}</p>}
            <br></br>
          </div>
        ))}
    </main>
  );
}
