import { useRouter } from 'next/router';

export default function User() {
  const router = useRouter();
  const { postId } = router.query;

  return <div>{postId}</div>;
}
