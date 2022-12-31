import Layout from 'components/layout/Layout';
import RealtimeDashboard from 'components/pages/RealtimeDashboard';
import useUser from 'hooks/useUser';

export default function RealtimePage() {
  const user = useUser();

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <RealtimeDashboard />
    </Layout>
  );
}
