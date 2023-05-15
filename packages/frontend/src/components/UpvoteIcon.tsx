import { faAngleUp, faSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface UpvoteIconProps {
  count: number;
  handler: () => void;
}

export const UpvoteIcon = (props: UpvoteIconProps) => {
  const { count, handler } = props;

  const outerStyle = {
    color: '#D0D5DD',
    '&:hover': {
      color: '#0E76FD',
    },
  };

  return (
    <div onClick={handler} className="flex gap-1 justify-center items-center cursor-pointer">
      <span className="fa-layers fa-fw">
        <FontAwesomeIcon icon={faSquare} style={outerStyle} />
        <FontAwesomeIcon icon={faAngleUp} color="#ffffff" transform="shrink-4" />
      </span>
      <p>{count}</p>
    </div>
  );
};
