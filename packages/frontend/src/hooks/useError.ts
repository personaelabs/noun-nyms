import { useState } from 'react';

const useError = ({ error }: { error: unknown }) => {
  console.log('inside use error: ', error);
  // default to unknown error
  const [errorMsg, setErrorMsg] = useState<string>('error unknown');

  if (error && error instanceof Error) setErrorMsg(error.message);
  return { errorMsg, isError: error !== null };
};

export default useError;
