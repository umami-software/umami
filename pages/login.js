import React from 'react';
import Layout from 'components/layout/Layout';
import LoginForm from 'components/forms/LoginForm';

export default function LoginPage({ loginDisabled }) {
  if (loginDisabled) {
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
    props: { loginDisabled: !!process.env.DISABLE_LOGIN || !!process.env.isCloudMode },
  };
}
