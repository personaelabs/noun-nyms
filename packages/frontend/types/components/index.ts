import { IRootPost } from '../api';

export type PostProps = IRootPost & {
  shouldOpenModal?: boolean;
};

export type PostWithRepliesProps = IRootPost & {
  isOpen: boolean;
  handleClose: (isOpen: boolean) => void;
  dateFromDescription: string;
};
