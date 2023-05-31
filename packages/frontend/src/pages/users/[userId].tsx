import { Header } from '@/components/Header';
import { Modal } from '@/components/global/Modal';
import { RetryError } from '@/components/global/RetryError';
import Spinner from '@/components/global/Spinner';
import { UserAvatar } from '@/components/global/UserAvatar';
import { PostPreview } from '@/components/post/PostPreview';
import { PostWithReplies } from '@/components/post/PostWithReplies';
import useError from '@/hooks/useError';
import useName from '@/hooks/useName';
import { IPostPreview, IUserUpvote } from '@/types/api';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { isAddress } from 'viem';

const getPostsByUserId = async (userId: string) =>
  (await axios.get<IPostPreview[]>(`/api/v1/users/${userId}/posts`)).data;

const getUpvotesByUserId = async (userId: string) =>
  (await axios.get<IUserUpvote[]>(`/api/v1/users/${userId}/upvotes`)).data;

export default function User() {
  const router = useRouter();
  const { errorMsg, setError } = useError();
  const userId = router.query.userId as string;
  const isDoxed = userId && isAddress(userId);

  // determine if post creator or replied to post (does post have a parent ID)
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

  const [openPostId, setOpenPostId] = useState<string>('');
  const [writerToShow, setWriterToShow] = useState<string>('');

  const openPost = useMemo(() => {
    // If openPostId has a root, fetch that data instead.
    let foundPost = userPosts?.find((p) => p.id === openPostId);
    return foundPost;
  }, [openPostId, userPosts]);

  const handleOpenPost = (id: string, writerToShow: string) => {
    setWriterToShow(writerToShow);
    setOpenPostId(id);
  };

  const { name } = useName({ userId });

  return (
    <>
      <Header />
      {openPost ? (
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
      <main className="flex w-full flex-col justify-center items-center">
        <div className="w-full bg-gray-50 flex flex-col justify-center items-center">
          <div className="bg-gray-50 min-h-screen w-full">
            <div className="relative max-w-3xl mx-auto py-16 px-6 md:px-0">
              <div className="absolute top-0 left-4 -translate-y-2/4 md:-translate-x-2/4">
                <div className="rounded-full w-[85px] h-[85px] bg-white flex items-center justify-center">
                  {userId && <UserAvatar userId={userId} width={75} />}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <a className="flex gap-1 items-center hover:underline" href={'/users'}>
                  <FontAwesomeIcon icon={faArrowLeft} className="secondary" />
                  <p>All users</p>
                </a>
                {name && <h2 className="break-words">{name}</h2>}
              </div>
              <div className="flex flex-col gap-8 max-w-3xl mx-auto py-5 md:py-10">
                {isLoading ? (
                  <Spinner />
                ) : isError ? (
                  <RetryError
                    message="Could not fetch user data."
                    error={errorMsg}
                    refetchHandler={refetch}
                  />
                ) : userPosts ? (
                  userPosts.map((post) => (
                    <PostPreview
                      showUserHeader={true}
                      key={post.id}
                      {...post}
                      handleOpenPost={(writerToShow: string) => {
                        router.replace(window.location.href, `/posts/${post.id}`, {
                          shallow: true,
                        });
                        handleOpenPost(post.id, writerToShow);
                      }}
                      onSuccess={() => console.log('need to refetch here')}
                    />
                  ))
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
