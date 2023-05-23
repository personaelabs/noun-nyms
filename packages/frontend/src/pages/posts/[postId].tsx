import { useRouter } from 'next/router';
import Posts from '@/components/Posts';
import Head from 'next/head';

export default function PostId() {
  const router = useRouter();
  const openPostId = router.query.postId as string;
  return (
    <>
      <Head>
        <title>Nym post</title>
        <meta property="og:title" content="The Rock" />
        <meta property="og:description" content="my post content" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:image" content="https://ia.media-imdb.com/images/rock.jpg" />
      </Head>
      {openPostId && <Posts initOpenPostId={openPostId} />}
    </>
  );
}
