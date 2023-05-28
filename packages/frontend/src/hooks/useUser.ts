import { useState } from 'react';

const useUser = (address: string | undefined) => {
  // default to unknown error
  const [isValid, setIsValid] = useState(false);

  console.log(`handling address change... ${address}`);

  return { address, isValid };
};

export default useUser;
