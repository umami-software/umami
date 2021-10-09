import React from 'react';
import Layout from 'components/layout/Layout';
import LoginForm from 'components/forms/LoginForm';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const { query } = useRouter();
  return (
    <Layout title="login" header={false} footer={false} center>
      <LoginForm hash={query.hash} />
    </Layout>
  );
}
