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
  const { formatMessage, labels, getErrorMessage } = useMessages();
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
        return formatMessage(labels.manager);
      case ROLES.teamMember:
        return formatMessage(labels.member);
      case ROLES.teamViewOnly:
        return formatMessage(labels.viewOnly);
    }
  };

  return (
    <Form onSubmit={handleSubmit} error={getErrorMessage(error)}>
      <FormField
        name="userId"
        label={formatMessage(labels.username)}
        rules={{ required: 'Required' }}
      >
        <UserSelect teamId={teamId} />
      </FormField>
      <FormField name="role" label={formatMessage(labels.role)} rules={{ required: 'Required' }}>
        <Select items={roles} renderValue={value => renderRole(value as any)}>
          {roles.map(value => (
            <ListItem key={value} id={value}>
              {renderRole(value)}
            </ListItem>
          ))}
        </Select>
      </FormField>
      <FormButtons>
        <Button isDisabled={isPending} onPress={onClose}>
          {formatMessage(labels.cancel)}
        </Button>
        <FormSubmitButton variant="primary" isDisabled={isPending}>
          {formatMessage(labels.save)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
