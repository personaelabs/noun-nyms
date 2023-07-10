export enum Status {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUCCEEDED = 'SUCCEEDED',
  QUEUED = 'QUEUED',
  EXECUTED = 'EXECUTED',
  CANCELLED = 'CANCELLED',
  DEFEATED = 'DEFEATED',
}

const getStatusColor = (status: string) => {
  if (status === Status.PENDING || status === Status.ACTIVE || status === Status.SUCCEEDED) {
    return 'bg-green-800';
  } else if (status === Status.EXECUTED) return 'bg-[#0E76FD]';
  else if (status === Status.CANCELLED || status === Status.DEFEATED) {
    return 'bg-red-700';
  } else return 'bg-gray-500';
};

export const PropStatusTag = (props: { status: Status }) => {
  const { status } = props;
  return (
    <div
      className={`shrink-0 text-white text-[8px] font-bold p-2 rounded-md leading-none w-min h-min ${getStatusColor(
        status,
      )}`}
    >
      {status}
    </div>
  );
};
