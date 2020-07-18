import React from 'react';
import Layout from 'components/layout';

export default function Home() {
  return (
    <Layout>
      Hello.
      <br />
      <a href="/?q=abc">abc</a>
      <br />
      <a href="/?q=123">123</a>
    </Layout>
  );
}
