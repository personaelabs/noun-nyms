import { Transition } from '@headlessui/react';
import { Fragment, ReactNode } from 'react';

export const TransitionFade = (props: { show: boolean; children: ReactNode }) => {
  const { show, children } = props;
  return (
    <Transition
      show={show}
      appear={true}
      enter="transition-opacity duration-100"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-0"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      as={Fragment}
    >
      {children}
    </Transition>
  );
};
