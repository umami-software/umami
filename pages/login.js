import React from 'react';
import Layout from 'components/layout/Layout';
import LoginForm from 'components/forms/LoginForm';

export default function LoginPage({ pageDisabled }) {
  if (pageDisabled) {
    return null;
  }

  return (
    <Layout title="login" header={false} footer={false} center>
      <LoginForm />
    </Layout>
  );
}

export async function getServerSideProps() {
  return {
    props: {
      pageDisabled: !!(process.env.DISABLE_LOGIN || process.env.DISABLE_ADMIN),
    },
  };
}
