import { useState } from 'react';

const useStupidHook = () => {
  const [stupidState, setStupidState] = useState(0);
  return { stupidState, setStupidState };
};

export default useStupidHook;
