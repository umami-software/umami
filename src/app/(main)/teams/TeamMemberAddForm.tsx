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
import { UserSelect } from '@/components/input/UserSelect';
import { ROLES } from '@/lib/constants';

const roles = [ROLES.teamManager, ROLES.teamMember, ROLES.teamViewOnly];

export function TeamMemberAddForm({
  teamId,
  onSave,
  onClose,
}: {
  teamId: string;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { t, labels, getErrorMessage } = useMessages();
  const { mutateAsync, error, isPending } = useUpdateQuery(`/teams/${teamId}/users`);

  const handleSubmit = async (data: any) => {
    await mutateAsync(data, {
      onSuccess: async () => {
        onSave?.();
        onClose?.();
      },
    });
  };

  const renderRole = role => {
    switch (role) {
      case ROLES.teamManager:
        return t(labels.manager);
      case ROLES.teamMember:
        return t(labels.member);
      case ROLES.teamViewOnly:
        return t(labels.viewOnly);
    }
  };

  return (
    <Form onSubmit={handleSubmit} error={getErrorMessage(error)}>
      <FormField name="userId" label={t(labels.username)} rules={{ required: 'Required' }}>
        <UserSelect teamId={teamId} />
      </FormField>
      <FormField name="role" label={t(labels.role)} rules={{ required: 'Required' }}>
        <Select renderValue={value => renderRole(value as any)}>
          {roles.map(value => (
            <ListItem key={value} id={value}>
              {renderRole(value)}
            </ListItem>
          ))}
        </Select>
      </FormField>
      <FormButtons>
        <Button isDisabled={isPending} onPress={onClose}>
          {t(labels.cancel)}
        </Button>
        <FormSubmitButton variant="primary" isDisabled={isPending}>
          {t(labels.save)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
