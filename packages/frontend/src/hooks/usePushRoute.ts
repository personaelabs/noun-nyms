import { useRouter } from 'next/router';
import { useState } from 'react';

const usePushRoute = () => {
  const router = useRouter();
  const [routeLoading, setRouteLoading] = useState(false);

  const pushRoute = async (route: string) => {
    setRouteLoading(true);
    await router.push(route);
    setRouteLoading(false);
  };

  return { routeLoading, pushRoute };
};

export default usePushRoute;
