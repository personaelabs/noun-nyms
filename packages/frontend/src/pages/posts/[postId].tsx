import { useRouter } from 'next/router';
import Posts from '..';

export default function PostId() {
  const router = useRouter();
  //TODO: is this good practice?
  const openPostId = router.query.postId as string;
  console.log({ openPostId });
  return <Posts openPostId={openPostId} />;
}
