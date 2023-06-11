import { PostPreview } from '@/components/post/PostPreview';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { IPostPreview } from '@/types/api';
import Spinner from './global/Spinner';
import { MainButton } from './MainButton';
import { useContext, useMemo, useState } from 'react';
import { NewPost } from './userInput/NewPost';
import { Upvote } from './Upvote';
import { RetryError } from './global/RetryError';
import useError from '@/hooks/useError';
import { UserContext } from '@/pages/_app';
import { UserContextType } from '@/types/components';
import { Filters } from './post/Filters';
import { SortSelect } from './post/SortSelect';
import { scrollToPost } from '@/lib/client-utils';
import { DiscardPostWarning } from './DiscardPostWarning';
import { PostWithRepliesModal } from './post/PostWithRepliesModal';

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
  const { isMobile, pushRoute } = useContext(UserContext) as UserContextType;

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
    const post = await scrollToPost(postId);
    setTimeout(() => {
      if (post) post.style.setProperty('opacity', '1');
    }, 1000);
  };

  const [newPostOpen, setNewPostOpen] = useState(false);
  const [openPostId, setOpenPostId] = useState<string>(initOpenPostId ? initOpenPostId : '');
  const [discardWarningOpen, setDiscardWarningOpen] = useState(false);

  const filterOptions: { [key: string]: string } = {
    timestamp: '⏳ Recent',
    upvotes: '🔥 Top',
  };
  const [filter, setFilter] = useState<string>('timestamp');
  const sortedPosts = useMemo(() => sortPosts(posts, filter), [posts, filter]);
  const handleOpenPost = (postId: string) => {
    if (isMobile) pushRoute(`/posts/${postId}`);
    else {
      window.history.pushState(null, '', `/posts/${postId}`);
      setOpenPostId(postId);
    }
  };

  return (
    <>
      {newPostOpen && (
        <NewPost
          handleClose={(postInProg?: string) => {
            if (postInProg) setDiscardWarningOpen(true);
            else setNewPostOpen(false);
          }}
          onSuccess={refetchAndScrollToPost}
        />
      )}
      {discardWarningOpen && (
        <DiscardPostWarning
          handleCloseWarning={() => setDiscardWarningOpen(false)}
          handleClosePost={() => {
            setNewPostOpen(false);
            setDiscardWarningOpen(false);
          }}
        />
      )}
      {openPostId && <PostWithRepliesModal openPostId={openPostId} setOpenPostId={setOpenPostId} />}
      <main className="flex w-full flex-col justify-center items-center">
        <div className="w-full bg-gray-50 flex flex-col justify-center items-center">
          <div className="bg-gray-50 min-h-screen w-full">
            <div className="flex flex-col gap-8 max-w-3xl mx-auto py-5 md:py-10 px-4 md:px-0">
              {isLoading ? (
                <>
                  <Spinner />
                </>
              ) : sortedPosts ? (
                <>
                  <div className="flex justify-between">
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
                        handler={() => setNewPostOpen(true)}
                      />
                    </div>
                  </div>
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
                        handleOpenPost={() => handleOpenPost(post.id)}
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
