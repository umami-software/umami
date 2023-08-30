import LoginLayout from 'components/pages/login/LoginLayout';
import LoginForm from 'components/pages/login/LoginForm';

export default function ({ disabled }) {
  if (disabled) {
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
      disabled: !!process.env.DISABLE_LOGIN,
    },
  };
}
