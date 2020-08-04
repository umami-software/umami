import React from 'react';
import { parse } from 'cookie';
import Layout from 'components/Layout';
import { verifySecureToken } from 'lib/crypto';
import WebsiteList from '../components/WebsiteList';

export default function HomePage({ username }) {
  return (
    <Layout>
      <WebsiteList />
    </Layout>
  );
}

export async function getServerSideProps({ req, res }) {
  const token = parse(req.headers.cookie || '')['umami.auth'];

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
