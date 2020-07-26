import React from 'react';
import Link from 'next/link';
import cookies from 'next-cookies';
import Layout from 'components/Layout';
import Chart from 'components/Chart';
import { verifySecureToken } from 'lib/crypto';

export default function HomePage({ username }) {
  return (
    <Layout>
      <h2>
        You've successfully logged in as <b>{username}</b>.
      </h2>
      <div>
        <Chart
          websiteId={3}
          startDate={Date.now() - 1000 * 60 * 60 * 24 * 7}
          endDate={Date.now()}
        />
      </div>
      <Link href="/logout">
        <a>Logout 🡒</a>
      </Link>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const token = cookies(context)['umami.auth'];

  try {
    const payload = await verifySecureToken(token);

    return {
      props: {
        ...payload,
      },
    };
  } catch {
    const { res } = context;

    res.statusCode = 303;
    res.setHeader('Location', '/login');
    res.end();
  }

  return { props: {} };
}
