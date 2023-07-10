import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Listbox } from '@headlessui/react';
import { TransitionFade } from '../global/TransitionFade';

interface SortSelectProps {
  options: { [key: string]: string };
  selectedQuery: string;
  setSelectedQuery: (filter: string) => void;
  leftAlign?: boolean;
}
export const SortSelect = (props: SortSelectProps) => {
  const { options, selectedQuery, setSelectedQuery, leftAlign } = props;
  return (
    <Listbox value={selectedQuery} onChange={setSelectedQuery}>
      {({ open }) => (
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-pointer py-2 pl-3 pr-7 text-left sm:text-sm">
            <span className="block">{options[selectedQuery]}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <FontAwesomeIcon icon={faChevronDown} />
            </span>
          </Listbox.Button>
          <TransitionFade show={open} transitionOnLeave={false}>
            <Listbox.Options
              className={`absolute ${
                leftAlign ? 'left-0' : 'left-full -translate-x-full'
              } mt-1 max-h-60 min-w-full w-max overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm`}
            >
              {Object.keys(options).map((s) => (
                <Listbox.Option
                  className="relative rounded-lg cursor-default select-none py-2 px-3 hover:bg-gray-100"
                  key={s}
                  value={s}
                >
                  {options[s]}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </TransitionFade>
        </div>
      )}
    </Listbox>
  );
};
