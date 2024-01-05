import { Button, Form, FormButtons, SubmitButton } from 'react-basics';
import useApi from 'components/hooks/useApi';
import useMessages from 'components/hooks/useMessages';
import { setValue } from 'store/cache';

export function TeamDeleteForm({
  teamId,
  teamName,
  onSave,
  onClose,
}: {
  teamId: string;
  teamName: string;
  onSave: () => void;
  onClose: () => void;
}) {
  const { formatMessage, labels, messages, FormattedMessage } = useMessages();
  const { del, useMutation } = useApi();
  const { mutate, error, isPending } = useMutation({
    mutationFn: (data: any) => del(`/teams/${teamId}`, data),
  });

  const handleSubmit = async data => {
    mutate(data, {
      onSuccess: async () => {
        setValue('teams', Date.now());
        onSave?.();
        onClose?.();
      },
    });
  };

  return (
    <Form onSubmit={handleSubmit} error={error}>
      <p>
        <FormattedMessage {...messages.confirmDelete} values={{ target: <b>{teamName}</b> }} />
      </p>
      <FormButtons flex>
        <SubmitButton variant="danger" disabled={isPending}>
          {formatMessage(labels.delete)}
        </SubmitButton>
        <Button onClick={onClose}>{formatMessage(labels.cancel)}</Button>
      </FormButtons>
    </Form>
  );
}

export default TeamDeleteForm;
