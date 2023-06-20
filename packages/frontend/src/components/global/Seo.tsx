import { NextSeo } from 'next-seo';

interface SeoProps {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
}

export const TITLE = 'Noun Nyms';
export const HOME_DESCRIPTION = 'Where the truth comes out';

export function Seo(props: SeoProps) {
  const { title, description, ogDescription, ogTitle } = props;

  return (
    <NextSeo
      title={title || TITLE}
      description={description || HOME_DESCRIPTION}
      openGraph={{
        title: ogTitle || TITLE,
        description: ogDescription || HOME_DESCRIPTION,
        site_name: 'Noun Nyms',
        type: 'website',
        images: [{ url: 'https://nouns.nymz.xyz/noun_og.jpg' }],
      }}
      twitter={{ cardType: 'summary', site: '@personaelabs' }}
    />
  );
}
