import Layout from 'components/layout/Layout';
import TestConsole from 'components/pages/TestConsole';
import useRequireLogin from 'hooks/useRequireLogin';

export default function ConsolePage({ pageDisabled }) {
  const { user } = useRequireLogin();

  if (pageDisabled || !user || !user.isAdmin) {
    return null;
  }

  return (
    <Layout>
      <TestConsole />
    </Layout>
  );
}

export async function getServerSideProps() {
  return {
    props: {
      pageDisabled: !process.env.ENABLE_TEST_CONSOLE,
    },
  };
}
