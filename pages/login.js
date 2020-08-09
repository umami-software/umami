import React from 'react';
import Layout from 'components/layout/Layout';
import LoginForm from 'components/forms/LoginForm';
import Icon from 'components/common/Icon';
import Logo from 'assets/logo.svg';

export default function LoginPage() {
  return (
    <Layout title="login" header={false} footer={false} center middle>
      <Icon icon={<Logo />} size="xlarge" />
      <LoginForm />
    </Layout>
  );
}
