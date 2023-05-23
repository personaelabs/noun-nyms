import { useRouter } from 'next/router';
import Posts from '@/components/Posts';
import { NextSeo } from 'next-seo';
import { GetServerSidePropsContext } from 'next';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const title = context.query.postId; // Replace this with your dynamic title logic
  return {
    props: {
      title,
    },
  };
}

export default function PostId({ title }: { title: string }) {
  const router = useRouter();
  const openPostId = router.query.postId as string;

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
