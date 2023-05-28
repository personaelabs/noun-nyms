import { useState } from 'react';

const useError = () => {
  // default to unknown error
  const [errorMsg, setErrorMsg] = useState('error unknown');
  const [isError, setIsError] = useState(false);

  const setError = (error: unknown) => {
    if (error && error instanceof Error) setErrorMsg(error.message);
    if (error) setIsError(true);
  };

  const clearError = () => {
    setErrorMsg('');
    setIsError(false);
  };

  return { errorMsg, setError, clearError, isError, setIsError };
};

export default useError;
