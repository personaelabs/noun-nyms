import { NextSeo } from 'next-seo';

interface SeoProps {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
}

export const TITLE = 'Nouns Nyms';
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
        site_name: 'Nouns Nyms',
        type: 'website',
        images: [{ url: 'https://nym.vercel.app/noun_og.jpg' }],
      }}
      twitter={{ cardType: 'summary', site: '@personaelabs' }}
    />
  );
}
