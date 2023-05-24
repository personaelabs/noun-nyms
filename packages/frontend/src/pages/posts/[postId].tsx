import { useRouter } from 'next/router';
import Posts from '@/components/Posts';
import { NextSeo } from 'next-seo';
import { GetServerSidePropsContext } from 'next';
import { postSelectSimple, IPostSimple } from '@/types/api/postSelectSimple';
import prisma from '@/lib/prisma';
import { createPublicClient, http, isAddress } from 'viem';
import { mainnet } from 'viem/chains';

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export async function getServerSideProps(
  context: GetServerSidePropsContext,
): Promise<{ props: { post: IPostSimple | null } }> {
  const id = context.query.postId; // Replace this with your dynamic title logic

  const postSimple = await prisma.post.findFirst({
    select: postSelectSimple,
    where: {
      id: id as string,
    },
  });

  if (postSimple) {
    // @ts-expect-error
    postSimple.timestamp = postSimple.timestamp.getTime();
    if (isAddress(postSimple.userId)) {
      const ensName = await publicClient.getEnsName({
        address: postSimple.userId,
      }); // @ts-expect-error;
      postSimple.name = ensName || postSimple.userId;
    }
  }

  return {
    props: {
      // @ts-expect-error name
      post: postSimple,
    },
  };
}

export default function PostId({ post }: { post?: IPostSimple }) {
  const router = useRouter();
  const openPostId = router.query.postId as string;

  let dateString = '';
  if (post) {
    // @ts-expect-error
    dateString = new Date(post.timestamp as number).toLocaleString();
  }
  const name = post?.name || post?.userId.split('-')[0] || '';
  const description = `${post?.body}\n️ - ${name}, ${dateString}`;
  const title = post?.title || '';
  return (
    <>
      {post && (
        <NextSeo
          // Title tbd
          title={title}
          description={description}
          openGraph={{
            title,
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
