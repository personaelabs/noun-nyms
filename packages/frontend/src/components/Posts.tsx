import { PostPreview } from '@/components/post/PostPreview';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { IPostPreview } from '@/types/api';
import Spinner from './global/Spinner';
import { MainButton } from './MainButton';
import { useMemo, useState } from 'react';
import { NewPost } from './userInput/NewPost';
import { Upvote } from './Upvote';
import { PostWithReplies } from './post/PostWithReplies';
import { Header } from './Header';

const getPosts = async () => (await axios.get<IPostPreview[]>('/api/v1/posts')).data;

interface PostsProps {
  initOpenPostId?: string;
}

export default function Posts(props: PostsProps) {
  const { initOpenPostId } = props;

  const {
    isLoading,
    refetch,
    data: posts,
  } = useQuery<IPostPreview[]>({
    queryKey: ['posts'],
    queryFn: getPosts,
    retry: 1,
    enabled: true,
    staleTime: 1000,
    refetchIntervalInBackground: true,
    refetchInterval: 30000, // 30 seconds
  });

  const manualRefetch = () => {
    console.log('MANUAL REFETCH');
    refetch();
  };

  const [newPostOpen, setNewPostOpen] = useState(false);
  const [openPostId, setOpenPostId] = useState<string>(initOpenPostId ? initOpenPostId : '');
  const openPost = useMemo(() => posts?.find((p) => p.id === openPostId), [openPostId, posts]);

  return (
    <>
      {newPostOpen ? (
        <NewPost handleClose={() => setNewPostOpen(false)} onSuccess={manualRefetch} />
      ) : null}
      {openPost ? <PostWithReplies {...openPost} handleClose={() => setOpenPostId('')} /> : null}
      <Header />
      <main className="flex w-full flex-col justify-center items-center">
        <div className="w-full bg-gray-50 flex flex-col justify-center items-center">
          <div className="bg-gray-50 min-h-screen w-full">
            <div className="flex flex-col gap-8 max-w-3xl mx-auto py-5 md:py-10 px-3 md:px-0">
              <div className="flex justify-end">
                <MainButton
                  color="#0E76FD"
                  message="Start Discussion"
                  loading={false}
                  handler={() => setNewPostOpen(true)}
                />
              </div>
              {isLoading ? (
                <>
                  <Spinner />
                </>
              ) : posts ? (
                <>
                  {posts.map((post) => (
                    <div className="flex gap-2" key={post.id}>
                      <Upvote upvotes={post.upvotes} postId={post.id} onSuccess={manualRefetch}>
                        <p className="font-semibold text-gray-700">{post.upvotes.length}</p>
                      </Upvote>
                      <PostPreview
                        {...post}
                        userId={post.userId}
                        handleOpenPost={() => setOpenPostId(post.id)}
                        onSuccess={manualRefetch}
                      />
                    </div>
                  ))}
                </>
              ) : // TODO: handle error state here
              null}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
