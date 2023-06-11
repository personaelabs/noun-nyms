import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Filters } from '../post/Filters';
import { useContext, useState } from 'react';
import { NotificationsContext } from '@/pages/_app';
import { Notification, NotificationsContextType } from '@/types/notifications';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { useAccount } from 'wagmi';

interface NotificationsToolsProps {
  setFiltered: (notifications: Notification[]) => void;
}

export const NotificationsTools = (props: NotificationsToolsProps) => {
  const { setFiltered } = props;
  const { notifications, setAsRead } = useContext(NotificationsContext) as NotificationsContextType;
  const { address } = useAccount();
  const [filter, setFilter] = useState('all');

  const filters = {
    all: 'All',
    unread: 'Unread',
  };

  const onFilterChange = (f: string) => {
    setFiltered(f === 'unread' ? notifications?.filter((n) => !n.read) : notifications);
  };

  const onMarkAll = () => setAsRead({ address, id: '', markAll: true });

  return (
    <div className="flex justify-between items-center">
      <Filters
        filters={filters}
        selectedFilter={filter}
        setSelectedFilter={setFilter}
        onFilterChange={onFilterChange}
      />
      <div className="flex gap-1 justify-end items-center cursor-pointer" onClick={onMarkAll}>
        <FontAwesomeIcon icon={faCheck} size={'xs'} />
        <p className="secondary hover:underline">Mark all as read</p>
      </div>
    </div>
  );
};
