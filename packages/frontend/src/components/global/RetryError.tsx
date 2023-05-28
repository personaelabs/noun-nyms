import { faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface RetryErrorProps {
  message: string;
  error?: any;
  refetchHandler: () => any;
}

export const RetryError = (props: RetryErrorProps) => {
  const { message, error, refetchHandler } = props;
  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="flex flex-col gap-2 items-center">
        <h4>{message}</h4>
        {error && <p className="text-center error">{error}</p>}
      </div>
      <div className="flex gap-2 items-center">
        <p>Retry?</p>
        <FontAwesomeIcon className="cursor-pointer" icon={faRotateRight} onClick={refetchHandler} />
      </div>
    </div>
  );
};
