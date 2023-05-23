import { useRouter } from 'next/router';
import Posts from '@/components/Posts';
import { NextSeo } from 'next-seo';

export default function PostId() {
  const router = useRouter();
  const openPostId = router.query.postId as string;
  const title = 'hi';

  return (
    <>
      <NextSeo
        title={title}
        openGraph={{
          title: title,
        }}
      />
      {openPostId && <Posts initOpenPostId={openPostId} />}
    </>
  );
}
