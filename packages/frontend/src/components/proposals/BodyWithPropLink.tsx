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
    if (regex.test(s)) {
      const proposal = proposals?.find((p) => p.id === s.substring(1));
      return proposal ? <PropLink string={s} proposal={proposal} /> : <span>{s}</span>;
    } else return <span>{s}</span>;
  });

  return <div className="inline-block whitespace-pre-wrap">{bodyWithPropLink}</div>;
};
