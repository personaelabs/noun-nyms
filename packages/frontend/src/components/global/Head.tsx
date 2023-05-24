import Head from 'next/head';

function HeadHtml() {
  return (
    <div>
      <Head>
        <title>Noun Nyms</title>
        <link type="favicon" rel="icon" href="/favicon-3.ico" />
        <meta property="og:image" content="/nouns_og.jpg" />
      </Head>
    </div>
  );
}

export default HeadHtml;
