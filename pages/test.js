import Head from 'next/head';
import Link from 'next/link';
import Layout from 'components/layout/Layout';

export default function Test({ websiteId }) {
  return (
    <>
      <Head>
        {typeof window !== 'undefined' && (
          <script async defer data-website-id={websiteId} src="/umami.js" />
        )}
      </Head>
      <Layout>
        <p>
          Here you can test if your umami installation works. Open the network tab in your browser's
          developer console and watch for requests to the url <b>collect</b>. The links below should
          trigger page views. Clicking on the button should trigger an event.
        </p>
        <h2>Page links</h2>
        <Link href="?q=1">
          <a>Page One</a>
        </Link>
        <br />
        <Link href="?q=2">
          <a>Page Two</a>
        </Link>
        <h2>Events</h2>
        <button
          id="primary-button"
          className="otherClass umami--click--primary-button"
          type="button"
        >
          Button
        </button>
      </Layout>
    </>
  );
}

export async function getStaticProps() {
  return {
    props: {
      websiteId: process.env.TEST_WEBSITE_ID,
    },
  };
}
