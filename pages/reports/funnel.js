import { useRouter } from 'next/router';
import AppLayout from 'components/layout/AppLayout';
import FunnelPage from 'components/pages/reports/FunnelPage';
import useMessages from 'hooks/useMessages';

export default function DetailsPage() {
  //   const { formatMessage, labels } = useMessages();
  //   const router = useRouter();
  //   const { id } = router.query;

  //   if (!id) {
  //     return null;
  //   }

  //   return <AppLayout title={formatMessage(labels.websites)}>{/* <FunnelPage /> */}</AppLayout>;

  return (
    <div>
      <FunnelPage />
    </div>
  );
}
