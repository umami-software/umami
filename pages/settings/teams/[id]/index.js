import AppLayout from 'components/layout/AppLayout';
import TeamSettings from 'components/pages/settings/teams/TeamSettings';
import { useRouter } from 'next/router';

export default function TeamDetailPage({ disabled }) {
  const router = useRouter();
  const { id } = router.query;

  if (!id || disabled) {
    return null;
  }

  return (
    <AppLayout>
      <TeamSettings teamId={id} />
    </AppLayout>
  );
}

export async function getServerSideProps() {
  return {
    props: {
      disabled: !!process.env.CLOUD_MODE,
    },
  };
}
