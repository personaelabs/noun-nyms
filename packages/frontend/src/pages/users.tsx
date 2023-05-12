import { UserPostCounts } from '@/types/api';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const getUsers = async () => (await axios.get<UserPostCounts[]>('/api/v1/users')).data;

export default function Users() {
  const { isLoading, data: users } = useQuery<UserPostCounts[]>({
    queryKey: ['users'],
    queryFn: getUsers,
    retry: 1,
    enabled: true,
    staleTime: 1000,
  });

  console.log(users);
  return (
    <main>
      <h1>Users</h1>
      <br></br>
      {users &&
        users.map((u) => (
          <div key={u.userId}>
            <p> Name: {u.name} </p>
            <p> Posts: {u.numPosts} </p>
            <p> Replies: {u.numReplies} </p>
            {u.lastActive && <p>Last active: {new Date(u.lastActive).toLocaleString()}</p>}
            <br></br>
          </div>
        ))}
    </main>
  );
}
