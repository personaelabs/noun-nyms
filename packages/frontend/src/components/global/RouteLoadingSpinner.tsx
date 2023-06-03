import Spinner from './Spinner';

export const RouteLoadingSpinner = () => {
  return (
    <div className="fixed right-4 bottom-4 bg-gray-200 rounded-full p-2">
      <Spinner />
    </div>
  );
};
