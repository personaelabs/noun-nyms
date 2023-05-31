import { ReactNode } from 'react';
import Spinner from './global/Spinner';

export const MainButton = (props: {
  color: string;
  message: string;
  loading: boolean;
  handler: () => void;
  disabled?: boolean;
  children?: ReactNode;
}) => {
  const { color, message, loading, handler, disabled, children } = props;

  return (
    <button
      className="font-bold text-white px-4 py-2.5 rounded-xl hover:scale-105 active:scale-100 transition-all pointer-cursor"
      style={{
        backgroundColor: color,
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'all',
      }}
      onClick={handler}
    >
      {children ? children : loading ? <Spinner /> : <p>{message}</p>}
    </button>
  );
};
