import { useMessages, useUpdateQuery } from '@/components/hooks';
import { ROLES } from '@/lib/constants';
import {
  Button,
  Select,
  Form,
  FormButtons,
  FormField,
  ListItem,
  FormSubmitButton,
} from '@umami/react-zen';

export function TeamMemberEditForm({
  teamId,
  userId,
  role,
  onSave,
  onClose,
}: {
  teamId: string;
  userId: string;
  role: string;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { mutateAsync, error, isPending } = useUpdateQuery(`/teams/${teamId}/users/${userId}`);
  const { formatMessage, labels, getErrorMessage } = useMessages();

  const handleSubmit = async (data: any) => {
    await mutateAsync(data, {
      onSuccess: async () => {
        onSave();
        onClose();
      },
    });
  };

  return (
    <Form onSubmit={handleSubmit} error={getErrorMessage(error)} defaultValues={{ role }}>
      <FormField
        name="role"
        rules={{ required: formatMessage(labels.required) }}
        label={formatMessage(labels.role)}
      >
        <Select>
          <ListItem id={ROLES.teamManager}>{formatMessage(labels.manager)}</ListItem>
          <ListItem id={ROLES.teamMember}>{formatMessage(labels.member)}</ListItem>
          <ListItem id={ROLES.teamViewOnly}>{formatMessage(labels.viewOnly)}</ListItem>
        </Select>
      </FormField>

      <FormButtons>
        <Button isDisabled={isPending} onPress={onClose}>
          {formatMessage(labels.cancel)}
        </Button>
        <FormSubmitButton variant="primary" isDisabled={false}>
          {formatMessage(labels.save)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
