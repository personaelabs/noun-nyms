import { PostPreview } from '@/components/post/PostPreview';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { IPostPreview } from '@/types/api';
import Spinner from './global/Spinner';
import { MainButton } from './MainButton';
import { useContext, useMemo, useState } from 'react';
import { NewPost } from './userInput/NewPost';
import { Upvote } from './Upvote';
import { PostWithReplies } from './post/PostWithReplies';
import { Header } from './Header';
import { RetryError } from './global/RetryError';
import useError from '@/hooks/useError';
import { useRouter } from 'next/router';
import { Modal } from './global/Modal';
import { UserContext } from '@/pages/_app';
import { UserContextType } from '@/types/components';
import { Filters } from './post/Filters';
import { SortSelect } from './post/SortSelect';

const getPosts = async () => (await axios.get<IPostPreview[]>('/api/v1/posts')).data;

const sortPosts = (posts: IPostPreview[] | undefined, query: string) => {
  return posts
    ? posts.sort((a, b) => {
        if (query === 'timestamp') {
          const val1 = b[query] || new Date();
          const val2 = a[query] || new Date();

          return Number(new Date(val1)) - Number(new Date(val2));
        } else if (query === 'upvotes') {
          return Number(b[query].length) - Number(a[query].length);
        } else return 0;
      })
    : posts;
};

interface PostsProps {
  initOpenPostId?: string;
}

export default function Posts(props: PostsProps) {
  const { initOpenPostId } = props;
  const { errorMsg, setError } = useError();
  const router = useRouter();
  const { isMobile } = useContext(UserContext) as UserContextType;

  const {
    isLoading,
    isError,
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
    onError: (error) => {
      setError(error);
    },
  });

  const refetchAndScrollToPost = async (postId?: string) => {
    await refetch();
    if (postId) {
      //wait for DOM to update
      setTimeout(() => {
        document.getElementById(postId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  };

  const [newPostOpen, setNewPostOpen] = useState(false);
  const [openPostId, setOpenPostId] = useState<string>(initOpenPostId ? initOpenPostId : '');

  const filterOptions: { [key: string]: string } = {
    timestamp: '⏳ Recent',
    upvotes: '🔥 Top',
  };
  const [filter, setFilter] = useState<string>('timestamp');
  const sortedPosts = useMemo(() => sortPosts(posts, filter), [posts, filter]);

  return (
    <>
      {newPostOpen ? (
        <NewPost handleClose={() => setNewPostOpen(false)} onSuccess={refetchAndScrollToPost} />
      ) : null}
      {openPostId ? (
        <Modal
          startAtTop={true}
          handleClose={() => {
            router.replace('/', undefined, { shallow: true });
            setOpenPostId('');
          }}
        >
          <PostWithReplies postId={openPostId} />
        </Modal>
      ) : null}
      <Header />
      <main className="flex w-full flex-col justify-center items-center">
        <div className="w-full bg-gray-50 flex flex-col justify-center items-center">
          <div className="bg-gray-50 min-h-screen w-full">
            <div className="flex flex-col gap-8 max-w-3xl mx-auto py-5 md:py-10 px-4 md:px-0">
              <div className="flex flex-row-reverse md:flex-row justify-between">
                {isMobile ? (
                  <SortSelect
                    options={filterOptions}
                    selectedQuery={filter}
                    setSelectedQuery={setFilter}
                  />
                ) : (
                  <Filters
                    filters={filterOptions}
                    selectedFilter={filter}
                    setSelectedFilter={setFilter}
                  />
                )}
                <div className="grow-0">
                  <MainButton
                    color="#0E76FD"
                    message="Start Discussion"
                    loading={false}
                    handler={() => setNewPostOpen(true)}
                  />
                </div>
              </div>
              {isLoading ? (
                <>
                  <Spinner />
                </>
              ) : sortedPosts ? (
                <>
                  {sortedPosts.map((post) => (
                    <div className="w-full flex gap-2" key={post.id}>
                      <Upvote
                        upvotes={post.upvotes}
                        col={true}
                        postId={post.id}
                        onSuccess={refetch}
                      >
                        <p className="font-semibold text-gray-700">{post.upvotes.length}</p>
                      </Upvote>
                      <PostPreview
                        {...post}
                        userId={post.userId}
                        handleOpenPost={() => {
                          if (isMobile) router.push(`/posts/${post.id}`);
                          else {
                            router.replace(window.location.href, `/posts/${post.id}`);
                            setOpenPostId(post.id);
                          }
                        }}
                        onSuccess={refetchAndScrollToPost}
                      />
                    </div>
                  ))}
                </>
              ) : isError ? (
                <RetryError
                  message={'Could not fetch posts:'}
                  error={errorMsg}
                  refetchHandler={refetch}
                />
              ) : null}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
