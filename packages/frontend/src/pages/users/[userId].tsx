import { IUserPost, IUserUpvote } from '@/types/api';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/router';

const getPostsByUserId = async (userId: string) =>
  (await axios.get<IUserPost[]>(`/api/v1/users/${userId}/posts`)).data;

const getUpvotesByUserId = async (userId: string) =>
  (await axios.get<IUserUpvote[]>(`/api/v1/users/${userId}/upvotes`)).data;

export default function User() {
  const router = useRouter();
  const userId = router.query.userId as string;

  const { isLoading: postsLoading, data: userPosts } = useQuery<IUserPost[]>({
    queryKey: ['userPosts', userId],
    queryFn: () => getPostsByUserId(userId),
    retry: 1,
    enabled: !!userId,
    staleTime: 1000,
  });

  const { isLoading: upvotesLoading, data: userUpvotes } = useQuery<IUserUpvote[]>({
    queryKey: ['userUpvotes', userId],
    queryFn: () => getUpvotesByUserId(userId),
    retry: 1,
    enabled: !!userId,
    staleTime: 1000,
  });

  return (
    <main>
      <h1>User Page Test</h1>
      <div>
        {userPosts && <p>Number of posts: {userPosts.length}</p>}
        {userUpvotes && <p>Number of upvotes: {userUpvotes.length}</p>}
      </div>
    </main>
  );
}
