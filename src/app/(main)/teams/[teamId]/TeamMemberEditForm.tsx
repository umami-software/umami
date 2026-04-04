import {
  Button,
  Form,
  FormButtons,
  FormField,
  FormSubmitButton,
  ListItem,
  Select,
} from '@umami/react-zen';
import { useMessages, useUpdateQuery } from '@/components/hooks';
import { ROLES } from '@/lib/constants';

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
  const { t, labels, getErrorMessage } = useMessages();

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
      <FormField name="role" rules={{ required: t(labels.required) }} label={t(labels.role)}>
        <Select>
          <ListItem id={ROLES.teamManager}>{t(labels.manager)}</ListItem>
          <ListItem id={ROLES.teamMember}>{t(labels.member)}</ListItem>
          <ListItem id={ROLES.teamViewOnly}>{t(labels.viewOnly)}</ListItem>
        </Select>
      </FormField>

      <FormButtons>
        <Button isDisabled={isPending} onPress={onClose}>
          {t(labels.cancel)}
        </Button>
        <FormSubmitButton variant="primary" isDisabled={false}>
          {t(labels.save)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
