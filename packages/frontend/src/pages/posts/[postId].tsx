import { useRouter } from 'next/router';
import Posts from '@/components/Posts';
import { NextSeo } from 'next-seo';
import { GetServerSidePropsContext } from 'next';
import { postSelectSimple, IPostSimple } from '@/types/api/postSelectSimple';
import prisma from '@/lib/prisma';
import useName from '@/hooks/useName';

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

export default function PostId({ post }: { post?: IPostSimple }) {
  const router = useRouter();
  const openPostId = router.query.postId as string;

  const name = useName({ userId: post?.userId });
  // const time = post ? new Date(post.timestamp.getTime()) | '';

  const description = `${name}\n${post?.body}\nNoun Nyms * ${post?.timestamp}`;

  return (
    <>
      {post && (
        <NextSeo
          // Title tbd
          title={post.title}
          description={description}
          openGraph={{
            title: post.title,
            description,
            site_name: 'Noun Nyms',
            type: 'website',
          }}
        />
      )}
      {openPostId && <Posts initOpenPostId={openPostId} />}
    </>
  );
}
