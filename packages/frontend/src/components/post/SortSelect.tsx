interface SortSelectProps {
  options: { [key: string]: string };
  selectedQuery: string;
  setSelectedQuery: (filter: string) => void;
}
export const SortSelect = (props: SortSelectProps) => {
  const { options, selectedQuery, setSelectedQuery } = props;
  return (
    <select
      className="outline-none bg-transparent font-semibold"
      value={selectedQuery}
      onChange={(e) => setSelectedQuery(e.target.value)}
    >
      {Object.keys(options).map((s) => (
        <option key={s} value={s}>
          {options[s]}
        </option>
      ))}
    </select>
  );
};
