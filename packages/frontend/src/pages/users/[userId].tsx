import { useRouter } from 'next/router';

export default function User() {
  const router = useRouter();
  const { userId } = router.query;

  return <div>User {userId}</div>;
}
