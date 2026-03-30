import { Button, LoadingButton, Row } from '@umami/react-zen';
import { PageHeader } from '@/components/common/PageHeader';
import { useBoard, useMessages, useNavigation } from '@/components/hooks';

export function DashboardEditHeader() {
  const { saveBoard, isPending } = useBoard();
  const { t, labels } = useMessages();
  const { router, renderUrl } = useNavigation();

  const handleSave = async () => {
    await saveBoard();
    router.push(renderUrl('/dashboard', false));
  };

  return (
    <PageHeader title={t(labels.dashboard)}>
      <Row gap="3">
        <Button variant="quiet" onPress={() => router.push(renderUrl('/dashboard', false))}>
          {t(labels.cancel)}
        </Button>
        <LoadingButton variant="primary" onPress={handleSave} isLoading={isPending}>
          {t(labels.save)}
        </LoadingButton>
      </Row>
    </PageHeader>
  );
}
