import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from 'components/layout/Layout';

export default function Test() {
  const router = useRouter();
  const { id } = router.query;

  if (!id) {
    return <h1>No id query specified.</h1>;
  }

  function handleClick() {
    window.umami('Custom event');
    window.umami.pageView('/fake', 'https://www.google.com');
    window.umami.pageEvent('pageEvent', 'custom-type');
  }

  return (
    <>
      <Head>
        {typeof window !== 'undefined' && (
          <script async defer data-website-id={id} src="/umami.js" />
        )}
      </Head>
      <Layout>
        <p>
          Here you can test if your umami installation works. Open the network tab in your browser
          developer console and watch for requests to the url <b>collect</b>. The links below should
          trigger page views. Clicking on the button should trigger an event.
        </p>
        <h2>Page links</h2>
        <Link href={`?id=${id}&q=1`}>
          <a>Page One</a>
        </Link>
        <br />
        <Link href={`?id=${id}&q=2`}>
          <a>Page Two</a>
        </Link>
        <h2>Events</h2>
        <button
          id="primary-button"
          className="otherClass umami--click--primary-button align-self-start"
          type="button"
        >
          Button
        </button>
        <h2>Manual trigger</h2>
        <button id="manual-button" type="button" onClick={handleClick}>
          Button
        </button>
      </Layout>
    </>
  );
}
