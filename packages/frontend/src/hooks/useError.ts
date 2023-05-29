import { useState } from 'react';

const useError = () => {
  // default to unknown error
  const [errorMsg, setErrorMsg] = useState('');
  const [isError, setIsError] = useState(false);

  const setError = (error: unknown) => {
    if (error) {
      setIsError(true);
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else setErrorMsg('error unknown');
    }
  };

  const clearError = () => {
    setErrorMsg('');
    setIsError(false);
  };

  return { errorMsg, setError, clearError, isError, setIsError };
};

export default useError;
