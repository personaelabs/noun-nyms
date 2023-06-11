interface SpinnerProps {
  color?: string;
  size?: string;
}

const Spinner = (props: SpinnerProps) => {
  const { color, size } = props;
  return (
    <div className="flex justify-center items-center">
      <div
        className={`border-2 border-t-2 border-t-white loader ease-linear rounded-full ${
          size ? 'w-' + size + ' h-' + size : 'w-4 h-4'
        } ${color ? 'border-' + color : 'border-gray-500'}`}
      />
    </div>
  );
};

export default Spinner;
