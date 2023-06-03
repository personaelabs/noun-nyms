import { NameType } from '@/types/components';
import { UserAvatar } from '../global/UserAvatar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

interface NameMenuItemProps {
  type: NameType;
  userId: string;
  name?: string;
  selected: boolean;
}

export const NameMenuItem = (props: NameMenuItemProps) => {
  const { type, userId, name, selected } = props;
  return (
    <div className="w-full flex justify-between items-center gap-2">
      <div className="min-w-0 shrink flex gap-2">
        <UserAvatar type={type} userId={userId} width={20} />
        <p className="breakText">{name}</p>
      </div>
      {selected ? <FontAwesomeIcon icon={faCheck} color={'#0E76FD'} className="shrink-0" /> : null}
    </div>
  );
};
