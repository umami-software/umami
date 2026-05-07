import { Button, LoadingButton, Row } from '@umami/react-zen';
import { PageHeader } from '@/components/common/PageHeader';
import { useBoard, useMessages, useNavigation } from '@/components/hooks';

export function BoardDesignHeader() {
  const { board, saveBoard, isPending } = useBoard();
  const { t, labels } = useMessages();
  const { router, renderUrl } = useNavigation();
  const title = board?.name || t(labels.untitled);

  const handleSave = async () => {
    await saveBoard();
    if (board.id) {
      router.push(renderUrl(`/boards/${board.id}`));
    }
  };

  const handleCancel = () => {
    if (board.id) {
      router.push(renderUrl(`/boards/${board.id}`));
    } else {
      router.push(renderUrl('/boards'));
    }
  };

  return (
    <PageHeader title={title}>
      <Row gap="3">
        <Button variant="quiet" onPress={handleCancel}>
          {t(labels.cancel)}
        </Button>
        <LoadingButton variant="primary" onPress={handleSave} isLoading={isPending}>
          {t(labels.save)}
        </LoadingButton>
      </Row>
    </PageHeader>
  );
}
