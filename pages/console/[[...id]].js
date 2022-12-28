import Layout from 'components/layout/Layout';
import TestConsole from 'components/pages/TestConsole';
import useUser from 'hooks/useUser';

export default function ConsolePage({ pageDisabled }) {
  const user = useUser();

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
