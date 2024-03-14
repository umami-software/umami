import { Button, Icon, Icons, Modal, ModalTrigger, Text } from 'react-basics';
import { useApi, useMessages, useModified } from 'components/hooks';
import ConfirmationForm from 'components/common/ConfirmationForm';

export function ReportDeleteButton({
  reportId,
  reportName,
  onDelete,
}: {
  reportId: string;
  reportName: string;
  onDelete?: () => void;
}) {
  const { formatMessage, labels, messages, FormattedMessage } = useMessages();
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
    <ModalTrigger>
      <Button>
        <Icon>
          <Icons.Trash />
        </Icon>
        <Text>{formatMessage(labels.delete)}</Text>
      </Button>
      <Modal title={formatMessage(labels.deleteReport)}>
        {(close: () => void) => (
          <ConfirmationForm
            message={
              <FormattedMessage
                {...messages.confirmDelete}
                values={{ target: <b>{reportName}</b> }}
              />
            }
            isLoading={isPending}
            error={error}
            onConfirm={handleConfirm.bind(null, close)}
            onClose={close}
            buttonLabel={formatMessage(labels.delete)}
          />
        )}
      </Modal>
    </ModalTrigger>
  );
}

export default ReportDeleteButton;
