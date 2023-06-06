import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Listbox, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface SortSelectProps {
  options: { [key: string]: string };
  selectedQuery: string;
  setSelectedQuery: (filter: string) => void;
}
export const SortSelect = (props: SortSelectProps) => {
  const { options, selectedQuery, setSelectedQuery } = props;
  return (
    <Listbox value={selectedQuery} onChange={setSelectedQuery}>
      <div className="relative">
        <Listbox.Button className="relative w-full cursor-pointer py-2 pl-3 pr-7 text-left sm:text-sm">
          <span className="block">{options[selectedQuery]}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <FontAwesomeIcon icon={faChevronDown} />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
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
        </Transition>
      </div>
    </Listbox>
  );
};
