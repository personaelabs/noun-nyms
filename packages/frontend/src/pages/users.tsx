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
  return <div>Users</div>;
}
