import { Transition } from '@headlessui/react';
import { Fragment, ReactNode } from 'react';

interface TransitionProps {
  show: boolean;
  duration?: number;
  transitionOnLeave?: boolean;
  children: ReactNode;
}

export const TransitionFade = (props: TransitionProps) => {
  const { show, duration = 100, transitionOnLeave = true, children } = props;
  const durationString = 'duration-' + duration;
  return (
    <Transition
      show={show}
      appear={true}
      enter={`transition-opacity ${durationString}`}
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave={`transition-opacity ${transitionOnLeave ? durationString : 'duration-0'}`}
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      as={Fragment}
    >
      {(ref) => <div ref={ref}>{children}</div>}
    </Transition>
  );
};
