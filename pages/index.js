import React from 'react';
import Link from 'next/link';
import Layout from 'components/Layout';
import Login from 'components/Login';

export default function Home() {
  return (
    <Layout>
      <Login />
      <p>
        <Link href="/test">
          <a>Test page 🡒</a>
        </Link>
      </p>
    </Layout>
  );
}
