import AppLayout from 'components/layout/AppLayout';
import TestConsole from 'components/pages/console/TestConsole';
import useUser from 'hooks/useUser';

export default function ConsolePage({ pageDisabled }) {
  const { user } = useUser();

  if (pageDisabled || !user || !user.isAdmin) {
    return null;
  }

  return (
    <AppLayout>
      <TestConsole />
    </AppLayout>
  );
}

export async function getServerSideProps() {
  return {
    props: {
      pageDisabled: !process.env.ENABLE_TEST_CONSOLE,
    },
  };
}
