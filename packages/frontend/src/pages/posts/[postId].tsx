import { useRouter } from 'next/router';
import Posts from '..';

export default function PostId() {
  const router = useRouter();
  const openPostId = router.query.postId as string;
  return <Posts initOpenPostId={openPostId} />;
}
