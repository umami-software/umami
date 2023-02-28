import AppLayout from 'components/layout/AppLayout';
import TestConsole from 'components/pages/console/TestConsole';

export default function ConsolePage({ disabled }) {
  if (disabled) {
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
      disabled: !process.env.ENABLE_TEST_CONSOLE,
    },
  };
}
