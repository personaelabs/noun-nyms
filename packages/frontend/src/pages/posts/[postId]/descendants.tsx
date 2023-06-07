import { IPostWDescendants } from '@/types/api';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/router';

const getPostsWithDescendants = async (postId: string) =>
  (await axios.get<IPostWDescendants>(`/api/v1/posts/${postId}/descendants`)).data;

// Utility function to get descendants regardless of whether post is a root or not.
const getDescendants = (post: IPostWDescendants) =>
  post.root ? post.root.descendants : post.descendants;

const Descendants = () => {
  const router = useRouter();
  const postId = router.query.postId as string;
  console.log(`postId`, postId);
  const {
    isLoading,
    isError,
    refetch,
    data: posts,
  } = useQuery<IPostWDescendants>({
    queryKey: ['postsWDescendants', postId],
    queryFn: () => getPostsWithDescendants(postId),
    retry: 1,
    enabled: !!postId,
    staleTime: 1000,
    refetchIntervalInBackground: true,
    refetchInterval: 30000, // 30 seconds
  });

  if (posts) console.log(getDescendants(posts));

  return <>Check console for data!</>;
};

export default Descendants;
