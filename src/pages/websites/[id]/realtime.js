import { useRouter } from 'next/router';
import AppLayout from 'components/layout/AppLayout';
import RealtimePage from 'components/pages/realtime/RealtimePage';

export default function () {
  const router = useRouter();
  const { id: websiteId } = router.query;

  if (!websiteId) {
    return null;
  }

  return (
    <AppLayout>
      <RealtimePage websiteId={websiteId} />
    </AppLayout>
  );
}
