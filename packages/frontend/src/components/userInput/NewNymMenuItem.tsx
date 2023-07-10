import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { newNym as TEXT } from '@/lib/text';

export const NewNymMenuItem = () => {
  return (
    <div className="flex gap-2 items-center">
      <FontAwesomeIcon icon={faPlus} className="w-5 text-blue" />
      <p>{TEXT.newNym}</p>
    </div>
  );
};
