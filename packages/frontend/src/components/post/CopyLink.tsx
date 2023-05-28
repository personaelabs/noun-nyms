import { faCheck, faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

export const CopyLink = (props: { id: string }) => {
  const { id } = props;

  const [linkCopied, setLinkCopied] = useState<boolean>(false);

  const copyLink = async () => {
    await parent.navigator.clipboard.writeText(window.location.origin + '/posts/' + id);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 5000);
  };
  return (
    <div
      className="flex gap-1 items-center cursor-pointer"
      onClick={async (e) => {
        e.stopPropagation();
        await copyLink();
      }}
    >
      <FontAwesomeIcon icon={linkCopied ? faCheck : faLink} color={linkCopied ? '#0e76fd' : ''} />
      <p className="secondary" style={{ fontWeight: linkCopied ? 'bold' : 'normal' }}>
        {linkCopied ? 'Copied' : 'Copy Link'}
      </p>
    </div>
  );
};
