import { NextSeo } from 'next-seo';

interface SeoProps {
  title: string;
  description: string;
}

export const TITLE = 'Noun Nyms';
export const HOME_DESCRIPTION = 'Where the truth comes out';

export function Seo(props: SeoProps) {
  const { title, description } = props;

  return (
    <NextSeo
      // Title tbd
      title={title}
      description={description}
      openGraph={{
        title,
        description,
        site_name: 'Noun Nyms',
        type: 'website',
        images: [{ url: 'https://nym-git-cha0s-link-personaelabs.vercel.app/noun_og.jpg' }],
      }}
      twitter={{ cardType: 'summary', site: '@personaelabs' }}
    />
  );
}
