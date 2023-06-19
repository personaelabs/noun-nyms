import { FAQ as TEXT } from '@/lib/text';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const FAQContent = () => {
  return (
    <>
      <p>
        <span className="font-bold">{TEXT.title} </span>
        <span>{TEXT.body}</span>
      </p>
      <div className="flex gap-2">
        <a href="https://github.com/personaelabs/nym">
          <FontAwesomeIcon icon={faGithub} size={'lg'} />
        </a>
      </div>
    </>
  );
};
