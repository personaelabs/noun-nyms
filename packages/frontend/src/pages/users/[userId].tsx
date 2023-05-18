import Spinner from '@/components/global/Spinner';
import { Post } from '@/components/post/Post';
import { PostWithReplies } from '@/components/post/PostWithReplies';
import { UserTag } from '@/components/post/UserTag';
import { IPostPreview, IUserUpvote } from '@/types/api';
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
  const userId = router.query.userId as string;
  const isDoxed = userId && isAddress(userId);

  // determine if post creator or replied to post (does post have a parent ID)
  const { isLoading: postsLoading, data: userPosts } = useQuery<IPostPreview[]>({
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
    enabled: !!isDoxed,
    staleTime: 1000,
  });

  const [openPostId, setOpenPostId] = useState<string>('');

  const openPost = useMemo(() => {
    // If openPostId has a root, fetch that data instead.
    let foundPost = userPosts?.find((p) => p.id === openPostId);
    if (!foundPost) foundPost = userUpvotes?.find((v) => v.post.id === openPostId)?.post;
    return foundPost;
  }, [openPostId, userPosts, userUpvotes]);

  return (
    <>
      {openPost ? <PostWithReplies {...openPost} handleClose={() => setOpenPostId('')} /> : null}
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
              {userId && <UserTag userId={userId} />}
              <div className="flex flex-col gap-8 max-w-3xl mx-auto py-5 md:py-10 px-3 md:px-0">
                <h4>Posts</h4>
                {postsLoading ? (
                  <Spinner />
                ) : userPosts ? (
                  userPosts.map((post) => (
                    <Post key={post.id} {...post} handleOpenPost={() => setOpenPostId(post.id)} />
                  ))
                ) : null}
                {/* TODO: Ugly code to only render upvotes when doxed */}
                {isDoxed ? (
                  <>
                    <h4>Upvotes</h4>
                    {upvotesLoading ? (
                      <Spinner />
                    ) : userUpvotes ? (
                      userUpvotes.map((vote) => (
                        <Post
                          key={vote.post.id}
                          {...vote.post}
                          handleOpenPost={() => setOpenPostId(vote.post.id)}
                        />
                      ))
                    ) : null}
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
