import { useRouter } from 'next/router';
import Posts from '@/components/Posts';

export default function PostId() {
  const router = useRouter();
  const openPostId = router.query.postId as string;
  return <>{openPostId && <Posts initOpenPostId={openPostId} />}</>;
}
