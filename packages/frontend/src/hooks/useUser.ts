import { useState } from 'react';

const useUser = () => {
  // default to unknown error
  const [address, setAddress] = useState('');
  const [isValid, setIsValid] = useState(false);

  const onAddressChange = (address: string) => {
    console.log(`handling address change... `);
    setAddress(address);
  };

  return { address, isValid, onAddressChange };
};

export default useUser;
