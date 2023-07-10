import { splitStringByExp } from '@/lib/client-utils';
import { PropsContext } from '@/pages/_app';
import { PropsContextType } from '@/types/components';
import { useContext } from 'react';
import { PropLink } from './PropLink';

export const BodyWithPropLink = ({ body }: { body: string }) => {
  const { proposals } = useContext(PropsContext) as PropsContextType;
  const regex = /#(\d+)/g;
  const strings = splitStringByExp(body, regex);

  const bodyWithPropLink = strings.map((s) => {
    regex.lastIndex = 0;
    const proposal = proposals?.find((p) => p.id === s.substring(1));
    if (proposal && regex.test(s)) return <PropLink string={s} proposal={proposal} />;
    else return <span>{s}</span>;
  });

  return <>{bodyWithPropLink}</>;
};
