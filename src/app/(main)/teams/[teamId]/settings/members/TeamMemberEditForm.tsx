import { useApi, useMessages } from '@/components/hooks';
import { ROLES } from '@/lib/constants';
import {
  Button,
  Dropdown,
  Form,
  FormButtons,
  FormInput,
  FormRow,
  Item,
  SubmitButton,
} from 'react-basics';

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

  const renderValue = (value: string) => {
    if (value === ROLES.teamManager) {
      return formatMessage(labels.manager);
    }
    if (value === ROLES.teamMember) {
      return formatMessage(labels.member);
    }
    if (value === ROLES.teamViewOnly) {
      return formatMessage(labels.viewOnly);
    }
  };

  return (
    <Form onSubmit={handleSubmit} error={error} values={{ role }}>
      <FormRow label={formatMessage(labels.role)}>
        <FormInput name="role" rules={{ required: formatMessage(labels.required) }}>
          <Dropdown
            renderValue={renderValue}
            style={{
              minWidth: '250px',
            }}
          >
            <Item key={ROLES.teamManager}>{formatMessage(labels.manager)}</Item>
            <Item key={ROLES.teamMember}>{formatMessage(labels.member)}</Item>
            <Item key={ROLES.teamViewOnly}>{formatMessage(labels.viewOnly)}</Item>
          </Dropdown>
        </FormInput>
      </FormRow>
      <FormButtons flex>
        <SubmitButton variant="primary" disabled={false}>
          {formatMessage(labels.save)}
        </SubmitButton>
        <Button disabled={isPending} onClick={onClose}>
          {formatMessage(labels.cancel)}
        </Button>
      </FormButtons>
    </Form>
  );
}

export default TeamMemberEditForm;
