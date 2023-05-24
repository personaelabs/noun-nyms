import { NextSeo } from 'next-seo';

function HeadHtml() {
  return (
    <div>
      <NextSeo
        // Title tbd
        title={'Noun Nyms'}
        description={'where the truth comes out'}
        openGraph={{
          title: 'Noun Nyms',
          description: 'where the truth comes out',
          site_name: 'Noun Nyms',
          type: 'website',
          images: [{ url: 'https://nym-git-cha0s-link-personaelabs.vercel.app/noun_og.jpg' }],
        }}
        twitter={{ cardType: 'summary', site: '@personaelabs' }}
      />
    </div>
  );
}

export default HeadHtml;
