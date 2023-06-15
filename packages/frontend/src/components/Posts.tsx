import { PostPreview } from '@/components/post/PostPreview';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { IPostPreview } from '@/types/api';
import Spinner from './global/Spinner';
import { MainButton } from './MainButton';
import { Fragment, useContext, useState } from 'react';
import { NewPost } from './userInput/NewPost';
import { Upvote } from './Upvote';
import { RetryError } from './global/RetryError';
import useError from '@/hooks/useError';
import { UserContext } from '@/pages/_app';
import { UserContextType } from '@/types/components';
import { Filters } from './post/Filters';
import { SortSelect } from './post/SortSelect';
import { refetchAndScrollToPost } from '@/lib/client-utils';
import { DiscardPostWarning } from './DiscardPostWarning';
import { PostWithRepliesModal } from './post/PostWithRepliesModal';
import { useEffect } from 'react';
import { posts as TEXT } from '@/lib/text';
import { WalletWarning } from './WalletWarning';
import { useAccount } from 'wagmi';

const PER_FETCH = 20;
const getPosts = async ({ pageParam = 0 }: { pageParam?: number }, filter: String) => {
  const data = (
    await axios.get<IPostPreview[]>('/api/v1/posts', {
      params: {
        offset: pageParam,
        limit: PER_FETCH,
        sort: filter,
      },
    })
  ).data;

  return data;
};

interface PostsProps {
  initOpenPostId?: string;
}

export default function Posts(props: PostsProps) {
  const { initOpenPostId } = props;
  const { errorMsg, setError } = useError();
  const { address } = useAccount();
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [openPostId, setOpenPostId] = useState(initOpenPostId ? initOpenPostId : '');
  const [discardWarningOpen, setDiscardWarningOpen] = useState(false);
  const [showWalletWarning, setShowWalletWarning] = useState(false);
  const { isMobile, isValid, pushRoute, postInProg } = useContext(UserContext) as UserContextType;
  const [filter, setFilter] = useState<string>('timestamp');

  const { isLoading, isFetchingNextPage, isError, refetch, fetchNextPage, data } = useInfiniteQuery(
    {
      queryKey: ['posts', { filter }],
      queryFn: ({ pageParam }) => getPosts({ pageParam }, filter),
      getNextPageParam: (_, pages) => pages.length * PER_FETCH,
      onError: (error) => {
        setError(error);
      },
    },
  );
  const [observedElement, setObservedElement] = useState<Element | null>();

  useEffect(() => {
    const el = window.document.querySelector('#lastPost');
    if (el && observedElement !== el) {
      const options = {
        root: null, // viewport,
        rootMargin: '0px',
        threshold: 0.1, // start fetching more as soon as 10% of the last post is visible
      };

      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            fetchNextPage();
            observer.unobserve(entry.target);
          }
        });
      }, options);
      observer.observe(el as Element);
      setObservedElement(el);
    }
  }, [data, fetchNextPage, observedElement]);

  const filterOptions: { [key: string]: string } = {
    timestamp: TEXT.filters.timestamp,
    upvotes: TEXT.filters.upvotes,
  };

  const handleOpenPost = (id: string) => {
    if (isMobile) pushRoute(`/posts/${id}`);
    else {
      window.history.pushState(null, '', `/posts/${id}`);
      setOpenPostId(id);
    }
  };

  return (
    <>
      {newPostOpen && (
        <NewPost
          handleClose={() => {
            if (postInProg) setDiscardWarningOpen(true);
            else setNewPostOpen(false);
          }}
          scrollToPost={async (postId: string) => await refetchAndScrollToPost(refetch, postId)}
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
      {showWalletWarning && (
        <WalletWarning handleClose={() => setShowWalletWarning(false)} action={TEXT.action} />
      )}
      {openPostId && <PostWithRepliesModal openPostId={openPostId} setOpenPostId={setOpenPostId} />}
      <main className="flex w-full flex-col justify-center items-center">
        <div className="w-full bg-gray-50 flex flex-col justify-center items-center">
          <div className="bg-gray-50 min-h-screen w-full">
            <div className="flex flex-col gap-8 max-w-3xl mx-auto py-5 md:py-10 px-4 md:px-0">
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
                    message={TEXT.buttonText}
                    handler={() => {
                      if (!address || !isValid) {
                        setShowWalletWarning(true);
                      } else setNewPostOpen(true);
                    }}
                  />
                </div>
              </div>
              {isLoading ? (
                <>
                  <Spinner />
                </>
              ) : data?.pages ? (
                <>
                  {data.pages.map((page, i) => (
                    <Fragment key={i}>
                      {page.map((post, j) => (
                        <div
                          className="w-full flex gap-2 items-center"
                          key={post.id}
                          id={
                            i === data.pages.length - 1 && j === page.length - 1 ? 'lastPost' : ''
                          }
                        >
                          <Upvote
                            upvotes={post.upvotes}
                            col={true}
                            postId={post.id}
                            onSuccess={refetch}
                          >
                            <p className="font-semibold text-gray-700">{post.upvotes.length}</p>
                          </Upvote>
                          <PostPreview
                            post={post}
                            handleOpenPost={() => handleOpenPost(post.id)}
                            onSuccess={async () => await refetchAndScrollToPost(refetch)}
                          />
                        </div>
                      ))}
                    </Fragment>
                  ))}
                  {isFetchingNextPage && (
                    <div className="flex justify-center my-4">
                      <Spinner />
                    </div>
                  )}
                </>
              ) : isError ? (
                <RetryError message={TEXT.fetchError} error={errorMsg} refetchHandler={refetch} />
              ) : null}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
