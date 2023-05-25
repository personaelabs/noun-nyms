import { faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface FetchErrorProps {
  message: string;
  refetchHandler: () => any;
}

export const FetchError = (props: FetchErrorProps) => {
  const { message, refetchHandler } = props;
  return (
    <div className="flex flex-col gap-4 items-center">
      <p>{message}</p>
      <FontAwesomeIcon className="cursor-pointer" icon={faRotateRight} onClick={refetchHandler} />
    </div>
  );
};
