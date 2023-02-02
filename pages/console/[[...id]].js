import AppLayout from 'components/layout/AppLayout';
import TestConsole from 'components/pages/console/TestConsole';

export default function ConsolePage({ pageDisabled }) {
  if (pageDisabled) {
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
