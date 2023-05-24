import Head from 'next/head';

function HeadHtml() {
  return (
    <div>
      <Head>
        <title>Noun Nyms</title>
        <link type="favicon" rel="icon" href="/favicon-3.ico" />
        <meta property="description" content="Where the truth comes out." />
        <meta
          property="og:image"
          content="https://nym-git-cha0s-link-personaelabs.vercel.app/noun_og.jpg"
        />
        <meta property="og:title" content="Noun Nyms" />
        <meta property="og:description" content="Where the truth comes out." />
      </Head>
    </div>
  );
}

export default HeadHtml;
