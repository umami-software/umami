import React from 'react';
import Link from 'next/link';
import { parse } from 'cookie';
import Layout from 'components/Layout';
import Chart from 'components/Chart';
import { verifySecureToken } from 'lib/crypto';
import { subDays, endOfDay } from 'date-fns';

export default function HomePage({ username }) {
  return (
    <Layout>
      <h2>
        You've successfully logged in as <b>{username}</b>.
      </h2>
      <div>
        <Chart
          websiteId={3}
          startDate={subDays(endOfDay(new Date()), 6)}
          endDate={endOfDay(new Date())}
        />
      </div>
      <Link href="/logout">
        <a>Logout 🡒</a>
      </Link>
    </Layout>
  );
}

export async function getServerSideProps({ req, res }) {
  const token = parse(req.headers.cookie)['umami.auth'];

  try {
    const payload = await verifySecureToken(token);

    return {
      props: {
        ...payload,
      },
    };
  } catch {
    res.statusCode = 303;
    res.setHeader('Location', '/login');
    res.end();
  }

  return { props: {} };
}
