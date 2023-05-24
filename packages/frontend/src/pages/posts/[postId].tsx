import { useRouter } from 'next/router';
import Posts from '@/components/Posts';
import { NextSeo } from 'next-seo';
import { GetServerSidePropsContext } from 'next';
import { postSelectSimple, IPostSimple } from '@/types/api/postSelectSimple';
import prisma from '@/lib/prisma';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const id = context.query.postId; // Replace this with your dynamic title logic

  const postSimple = await prisma.post.findFirst({
    select: postSelectSimple,
    where: {
      id: id as string,
    },
  });

  return {
    props: {
      post: postSimple,
    },
  };
}

export default function PostId({ post }: { post: IPostSimple }) {
  const router = useRouter();
  const openPostId = router.query.postId as string;

  return (
    <>
      <NextSeo
        title={post.title}
        openGraph={{
          title: post.title,
        }}
      />
      {openPostId && <Posts initOpenPostId={openPostId} />}
    </>
  );
}
