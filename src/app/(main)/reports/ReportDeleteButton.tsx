import { Button, Icon, Icons, Modal, DialogTrigger, Dialog, Text } from '@umami/react-zen';
import { useApi, useMessages, useModified } from '@/components/hooks';
import { ConfirmationForm } from '@/components/common/ConfirmationForm';

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
  const { del, useMutation } = useApi();
  const { mutate, isPending, error } = useMutation({
    mutationFn: reportId => del(`/reports/${reportId}`),
  });
  const { touch } = useModified();

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
          <Icons.Trash />
        </Icon>
        <Text>{formatMessage(labels.delete)}</Text>
      </Button>
      <Modal>
        <Dialog title={formatMessage(labels.deleteReport)}>
          {({ close }) => (
            <ConfirmationForm
              message={formatMessage(messages.confirmDelete, {
                target: <b key="report-name">{reportName}</b>,
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
