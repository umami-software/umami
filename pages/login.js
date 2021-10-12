import React from 'react';
import Layout from 'components/layout/Layout';
import LoginForm from 'components/forms/LoginForm';
import AutoLogin from 'components/forms/AutoLogin';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const { query } = useRouter();
  if (query.hash) {
    return (
      <Layout title="login" header={false} footer={false} center>
        <AutoLogin hash={query.hash} />
      </Layout>
    );
  } else {
    return (
      <Layout title="login" header={false} footer={false} center>
        <LoginForm />
      </Layout>
    );
  }
}
