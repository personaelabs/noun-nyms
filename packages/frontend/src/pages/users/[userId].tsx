import { Header } from '@/components/Header';
import { Modal } from '@/components/global/Modal';
import { RetryError } from '@/components/global/RetryError';
import Spinner from '@/components/global/Spinner';
import { UserAvatar } from '@/components/global/UserAvatar';
import { Filters } from '@/components/post/Filters';
import { PostPreview } from '@/components/post/PostPreview';
import { PostWithReplies } from '@/components/post/PostWithReplies';
import useError from '@/hooks/useError';
import useName from '@/hooks/useName';
import { IPostPreview } from '@/types/api';
import { NameType, UserContextType } from '@/types/components';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useContext, useMemo, useState } from 'react';
import { UserContext } from '../_app';

const getPostsByUserId = async (userId: string) =>
  (await axios.get<IPostPreview[]>(`/api/v1/users/${userId}/posts`)).data;

const filterPosts = (posts: IPostPreview[] | undefined, query: string) => {
  if (posts) {
    if (query === 'all') return posts;
    return posts.filter((p) => (query === 'posts' ? !p.root : p.root));
  } else return posts;
};

export default function User() {
  const router = useRouter();
  const { errorMsg, setError } = useError();
  const userId = router.query.userId as string;

  const filterOptions: { [key: string]: string } = {
    all: 'All',
    posts: 'Posts',
    replies: 'Comments',
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
  const [openPostId, setOpenPostId] = useState<string>('');
  const [writerToShow, setWriterToShow] = useState<string>('');

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
      <main className="flex h-screen w-full flex-col items-center">
        <Header />
        {openPost && !isMobile ? (
          <Modal
            startAtTop={true}
            handleClose={() => {
              router.replace('/', undefined, { shallow: true });
              setOpenPostId('');
            }}
          >
            <PostWithReplies writerToShow={writerToShow} postId={openPostId} />
          </Modal>
        ) : null}
        <div className="h-full flex flex-col bg-gray-50 max-w-3xl mx-auto w-full p-6">
          <div className="flex flex-col gap-4">
            <div
              className="flex gap-1 items-center underline cursor-pointer"
              onClick={() => pushRoute('/users')}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="secondary" />
              <p>All users</p>
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
              <RetryError
                message="Could not fetch user data."
                error={errorMsg}
                refetchHandler={refetch}
              />
            ) : filteredPosts && filteredPosts.length > 0 ? (
              <>
                {filteredPosts.map((post) => (
                  <div key={post.id}>
                    <PostPreview
                      showUserHeader={true}
                      {...post}
                      handleOpenPost={(writerToShow: string) => {
                        if (isMobile) pushRoute(`/posts/${post.id}`);
                        else
                          router.replace(window.location.href, `/posts/${post.id}`, {
                            shallow: true,
                          });
                        handleOpenPost(post.id, writerToShow);
                      }}
                      onSuccess={() => console.log('need to refetch here')}
                    />
                  </div>
                ))}
              </>
            ) : (
              <div className="m-auto">
                <p>User has no activity.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
