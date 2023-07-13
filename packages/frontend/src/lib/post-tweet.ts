import { clientFactory } from './twitter';

export const postTweet = async (postId: string, user: string) => {
  const url = process.env.NEXT_PUBLIC_SITE_URL + '/posts/' + postId;
  const client = clientFactory();
  await client.v2.tweet(url);
};
