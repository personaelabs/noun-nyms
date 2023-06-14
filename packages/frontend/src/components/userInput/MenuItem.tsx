import { ReactNode, Ref, forwardRef } from 'react';

interface MenuItemProps {
  active: boolean;
  children: ReactNode;
  onClickHandler: () => void;
}

const MenuItem = forwardRef((props: MenuItemProps, ref: Ref<HTMLButtonElement>) => {
  const { children, active, onClickHandler } = props;
  return (
    <button
      ref={ref}
      className={`w-full justify-between items-center flex gap-2 px-2 py-2.5 rounded-xl hover:bg-gray-100 ${
        active ? 'bg-gray-100' : 'bg-white'
      }`}
      onClick={onClickHandler}
    >
      {children}
    </button>
  );
});

MenuItem.displayName = 'MenuItem';

export default MenuItem;
