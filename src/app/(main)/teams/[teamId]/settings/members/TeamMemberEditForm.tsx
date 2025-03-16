import { useApi, useMessages } from '@/components/hooks';
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
  const { post, useMutation } = useApi();
  const { mutate, error, isPending } = useMutation({
    mutationFn: (data: any) => post(`/teams/${teamId}/users/${userId}`, data),
  });
  const { formatMessage, labels } = useMessages();

  const handleSubmit = async (data: any) => {
    mutate(data, {
      onSuccess: async () => {
        onSave();
        onClose();
      },
    });
  };

  return (
    <Form onSubmit={handleSubmit} error={error} values={{ role }}>
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
        <FormSubmitButton variant="primary" isDisabled={false}>
          {formatMessage(labels.save)}
        </FormSubmitButton>
        <Button isDisabled={isPending} onPress={onClose}>
          {formatMessage(labels.cancel)}
        </Button>
      </FormButtons>
    </Form>
  );
}
