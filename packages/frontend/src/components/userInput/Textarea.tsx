interface Props {
  value: string;
  onChangeHandler: (newVal: string) => void;
  placeholder: string;
  minHeight: number;
}

export const Textarea = ({ value, onChangeHandler, placeholder, minHeight }: Props) => {
  return (
    <div className="w-full relative" style={{ minHeight: minHeight }}>
      <pre className="block invisible">{value}</pre>
      <textarea
        className="border py-4 px-6"
        placeholder={placeholder}
        value={value}
        onChange={(evt) => onChangeHandler(evt.target.value)}
      />
    </div>
  );
};
