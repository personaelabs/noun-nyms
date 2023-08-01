import { splitStringByExps } from '@/lib/client-utils';
import { PropsContext } from '@/pages/_app';
import { PropsContextType } from '@/types/components';
import { useContext } from 'react';
import { PropLink } from './PropLink';

export const BodyWithPropLink = ({ body }: { body: string }) => {
  const { proposals } = useContext(PropsContext) as PropsContextType;
  const propRegex = /#(\d+)/g;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const strings = splitStringByExps(body, [propRegex, urlRegex]);

  const bodyWithPropLink = strings.map((s) => {
    propRegex.lastIndex = 0;
    urlRegex.lastIndex = 0;
    if (propRegex.test(s)) {
      const proposal = proposals?.find((p) => p.id === s.substring(1));
      return proposal ? <PropLink string={s} proposal={proposal} /> : <span>{s}</span>;
    } else if (urlRegex.test(s)) {
      return (
        <a className="underline cursor-pointer break-all" href={s} key={s} target="_blank">
          {s}
        </a>
      );
    } else return <span>{s}</span>;
  });

  return <div className="inline-block whitespace-pre-wrap">{bodyWithPropLink}</div>;
};
