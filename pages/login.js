import React from 'react';
import Layout from 'components/Layout';
import Login from 'components/Login';
import Icon from 'components/Icon';
import Logo from 'assets/logo.svg';

export default function LoginPage() {
  return (
    <Layout title="login" header={false} footer={false} center middle>
      <Icon icon={<Logo />} size="XL" />
      <Login />
    </Layout>
  );
}
