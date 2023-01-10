import { useRouter } from 'next/router';
import Layout from 'components/layout/Layout';
import Dashboard from 'components/pages/dashboard/Dashboard';
import useConfig from 'hooks/useConfig';
import useRequireLogin from 'hooks/useRequireLogin';

export default function DashboardPage() {
  const {
    query: { id },
    isReady,
    asPath,
  } = useRouter();
  const { user } = useRequireLogin();
  const { adminDisabled } = useConfig();

  if (adminDisabled || !user || !isReady) {
    return null;
  }

  const userId = id?.[0];

  return (
    <Layout>
      <Dashboard key={asPath} userId={user.id || userId} />
    </Layout>
  );
}
