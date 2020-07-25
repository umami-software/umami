import React from 'react';
import { serialize } from 'cookie';
import Layout from 'components/Layout';

export default function LogoutPage() {
  return (
    <Layout title="Logout">
      <h2>You've successfully logged out..</h2>
    </Layout>
  );
}

export async function getServerSideProps({ res }) {
  const cookie = serialize('umami.auth', '', {
    path: '/',
    httpOnly: true,
    maxAge: 0,
  });

  res.statusCode = 303;
  res.setHeader('Set-Cookie', [cookie]);
  res.setHeader('Location', '/login');

  res.end();

  return { props: {} };
}
