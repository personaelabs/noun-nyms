import useError from '@/hooks/useError';
import useName from '@/hooks/useName';
import { IPostPreview } from '@/types/api';
import { NameType, UserContextType } from '@/types/components';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useContext, useMemo, useState } from 'react';
import { UserContext } from '../pages/_app';
import { PostWithRepliesModal } from '@/components/post/PostWithRepliesModal';
import { refetchAndScrollToPost } from '@/lib/client-utils';
import { UserAvatar } from './global/UserAvatar';
import { Filters } from './post/Filters';
import Spinner from './global/Spinner';
import { RetryError } from './global/RetryError';
import { PostPreview } from './post/PostPreview';
import { user as TEXT } from '@/lib/text';

const getPostsByUserId = async (userId: string) =>
  (await axios.get<IPostPreview[]>(`/api/v1/users/${userId}/posts`)).data;

const filterPosts = (posts: IPostPreview[] | undefined, query: string) => {
  if (posts) {
    if (query === 'all') return posts;
    return posts.filter((p) => (query === 'posts' ? !p.root : p.root));
  } else return posts;
};

export default function User({ userId }: { userId: string }) {
  const { errorMsg, setError } = useError();

  const filterOptions: { [key: string]: string } = {
    all: TEXT.filters.all,
    posts: TEXT.filters.posts,
    replies: TEXT.filters.replies,
  };

  const {
    isError,
    isLoading,
    refetch,
    data: userPosts,
  } = useQuery<IPostPreview[]>({
    queryKey: ['userPosts', userId],
    queryFn: () => getPostsByUserId(userId),
    retry: 1,
    enabled: !!userId,
    staleTime: 1000,
    onError: (error) => {
      setError(error);
    },
  });

  const { isMobile, pushRoute } = useContext(UserContext) as UserContextType;
  const [openPostId, setOpenPostId] = useState('');
  const [writerToShow, setWriterToShow] = useState('');

  const [filter, setFilter] = useState<string>('all');
  const filteredPosts = useMemo(() => filterPosts(userPosts, filter), [userPosts, filter]);

  const openPost = useMemo(() => {
    // If openPostId has a root, fetch that data instead.
    let foundPost = userPosts?.find((p) => p.id === openPostId);
    return foundPost;
  }, [openPostId, userPosts]);

  const handleOpenPost = (id: string, writerToShow: string) => {
    setWriterToShow(writerToShow);
    setOpenPostId(id);
  };

  const { name, isDoxed } = useName({ userId });

  return (
    <>
      <main className="flex h-screen bg-gray-50 w-full flex-col items-center">
        {!isMobile && (
          <PostWithRepliesModal
            isOpen={openPost !== undefined}
            writerToShow={writerToShow}
            openPostId={openPostId}
            setOpenPostId={setOpenPostId}
          />
        )}
        <div className="h-full flex flex-col max-w-3xl mx-auto w-full p-6">
          <div className="flex flex-col gap-4">
            <div
              className="flex gap-1 items-center underline cursor-pointer"
              onClick={() => pushRoute('/users')}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="secondary" />
              <p>{TEXT.backButtonText}</p>
            </div>
            <div className="flex gap-2 items-center">
              <div className="rounded-full w-[85px] h-[85px] bg-white flex items-center justify-center">
                {userId && (
                  <UserAvatar
                    type={isDoxed ? NameType.DOXED : NameType.PSEUDO}
                    userId={userId}
                    width={75}
                  />
                )}
              </div>
              {name && <h2 className="break-words breakText">{name}</h2>}
            </div>
          </div>

          <div className="flex grow w-full flex-col gap-8 max-w-3xl mx-auto py-5 md:py-10">
            <Filters
              filters={filterOptions}
              selectedFilter={filter}
              setSelectedFilter={setFilter}
            />
            {isLoading ? (
              <Spinner />
            ) : isError ? (
              <RetryError message={TEXT.fetchError} error={errorMsg} refetchHandler={refetch} />
            ) : filteredPosts && filteredPosts.length > 0 ? (
              <>
                {filteredPosts.map((post) => (
                  <div key={post.id}>
                    <PostPreview
                      showUserHeader={true}
                      post={post}
                      handleOpenPost={(writerToShow: string) => {
                        if (isMobile) pushRoute(`/posts/${post.id}`);
                        else window.history.pushState(null, '', `/posts/${post.id}`);
                        handleOpenPost(post.id, writerToShow);
                      }}
                      onSuccess={async () => await refetchAndScrollToPost(refetch)}
                    />
                  </div>
                ))}
              </>
            ) : (
              <div className="m-auto">
                <p>{TEXT.noData}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
