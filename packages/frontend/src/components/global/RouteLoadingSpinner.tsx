import Spinner from './Spinner';

export const RouteLoadingSpinner = () => {
  return (
    <div className="fixed right-6 bottom-6 bg-gray-200 rounded-full p-2 z-50">
      <Spinner />
    </div>
  );
};
