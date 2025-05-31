import { Button, Icon, Modal, DialogTrigger, Dialog, Text } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { Trash } from '@/components/icons';
import { ConfirmationForm } from '@/components/common/ConfirmationForm';
import { useDeleteQuery } from '@/components/hooks/queries/useDeleteQuery';

export function ReportDeleteButton({
  reportId,
  reportName,
  onDelete,
}: {
  reportId: string;
  reportName: string;
  onDelete?: () => void;
}) {
  const { formatMessage, labels, messages } = useMessages();
  const { mutate, isPending, error, touch } = useDeleteQuery(`/reports/${reportId}`);

  const handleConfirm = (close: () => void) => {
    mutate(reportId as any, {
      onSuccess: () => {
        touch('reports');
        onDelete?.();
        close();
      },
    });
  };

  return (
    <DialogTrigger>
      <Button>
        <Icon>
          <Trash />
        </Icon>
        <Text>{formatMessage(labels.delete)}</Text>
      </Button>
      <Modal>
        <Dialog title={formatMessage(labels.deleteReport)}>
          {({ close }) => (
            <ConfirmationForm
              message={formatMessage(messages.confirmDelete, {
                target: <b key={messages.confirmDelete.id}>{reportName}</b>,
              })}
              isLoading={isPending}
              error={error}
              onConfirm={handleConfirm.bind(null, close)}
              onClose={close}
              buttonLabel={formatMessage(labels.delete)}
            />
          )}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
