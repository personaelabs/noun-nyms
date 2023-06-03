interface FilterProps {
  filters: { [key: string]: string };
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
}
export const Filters = (props: FilterProps) => {
  const { filters, selectedFilter, setSelectedFilter } = props;
  return (
    <div className="flex flex-wrap gap-4">
      {Object.keys(filters).map((f) => (
        <button
          key={f}
          className={`${
            f === selectedFilter ? 'bg-gray-200' : 'bg-transparent'
          } hover:bg-gray-200 px-4 py-2 rounded-xl`}
          onClick={() => setSelectedFilter(f)}
        >
          <p className="font-semibold text-gray-500">{filters[f]}</p>
        </button>
      ))}
    </div>
  );
};
