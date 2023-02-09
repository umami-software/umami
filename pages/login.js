import LoginLayout from 'components/pages/login/LoginLayout';
import LoginForm from 'components/pages/login/LoginForm';

export default function LoginPage({ pageDisabled }) {
  if (pageDisabled) {
    return null;
  }

  return (
    <LoginLayout title="login">
      <LoginForm />
    </LoginLayout>
  );
}

export async function getServerSideProps() {
  return {
    props: {
      pageDisabled: !!process.env.CLOUD_MODE,
    },
  };
}
