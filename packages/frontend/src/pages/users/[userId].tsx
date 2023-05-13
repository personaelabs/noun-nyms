import { Post } from '@/components/Post';
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

  // determine if post creator or replied to post (does post have a parent ID)
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
    <main className="flex w-full flex-col justify-center items-center">
      <div className="w-full bg-gray-50 flex flex-col justify-center items-center">
        <div className="bg-black dots w-full">
          <div className="pt-8">
            <nav className="pr-6 flex justify-end">
              <p className="text-white">Connect Wallet</p>
            </nav>
          </div>
        </div>
        <div className="py-8"></div>
        <div className="bg-gray-50 min-h-screen w-full">
          <div className="max-w-3xl mx-auto py-5 md:py-10 px-3 md:px-0">
            <h2>{userId}</h2>
            <div className="flex flex-col gap-8 max-w-3xl mx-auto py-5 md:py-10 px-3 md:px-0">
              <h4>Posts</h4>
              {userPosts &&
                userPosts.map((post) => <Post key={post.id} {...post} userId="John Doe" />)}
              <h4>Upvotes</h4>
              {userUpvotes &&
                userUpvotes.map((vote) => (
                  <Post key={vote.post.id} {...vote.post} userId="John Doe" />
                ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
