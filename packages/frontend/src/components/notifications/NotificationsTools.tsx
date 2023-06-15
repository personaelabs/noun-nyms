import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Filters } from '../post/Filters';
import { useContext, useMemo, useState } from 'react';
import { NotificationsContext } from '@/pages/_app';
import { Notification, NotificationsContextType } from '@/types/notifications';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { useAccount } from 'wagmi';
import { notifications as TEXT } from '@/lib/text';

interface NotificationsToolsProps {
  setFiltered: (notifications: Notification[]) => void;
}

export const NotificationsTools = (props: NotificationsToolsProps) => {
  const { setFiltered } = props;
  const { notifications, setAsRead } = useContext(NotificationsContext) as NotificationsContextType;
  const { address } = useAccount();
  const [filter, setFilter] = useState('all');
  const numUnread = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const filters = {
    all: TEXT.filters.all,
    unread: TEXT.filters.unread + ' (' + numUnread + ')',
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
        <p className="secondary hover:underline">{TEXT.markAllAsRead}</p>
      </div>
    </div>
  );
};
