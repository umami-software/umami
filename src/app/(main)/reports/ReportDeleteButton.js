import { Button, Icon, Icons, Modal, ModalTrigger, Text } from 'react-basics';
import ConfirmDeleteForm from 'components/common/ConfirmDeleteForm';
import { useApi, useMessages } from 'components/hooks';
import { setValue } from 'store/cache';

export function ReportDeleteButton({ reportId, reportName, onDelete }) {
  const { formatMessage, labels } = useMessages();
  const { del, useMutation } = useApi();
  const { mutate } = useMutation(reportId => del(`/reports/${reportId}`));

  const handleConfirm = close => {
    mutate(reportId, {
      onSuccess: () => {
        setValue('reports', Date.now());
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
      <Modal>
        {close => (
          <ConfirmDeleteForm
            name={reportName}
            onConfirm={handleConfirm.bind(null, close)}
            onClose={close}
          />
        )}
      </Modal>
    </ModalTrigger>
  );
}

export default ReportDeleteButton;
