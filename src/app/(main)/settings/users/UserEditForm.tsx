import {
  Dropdown,
  Item,
  Form,
  FormRow,
  FormButtons,
  FormInput,
  TextField,
  SubmitButton,
  PasswordField,
} from 'react-basics';
import useApi from 'components/hooks/useApi';
import { ROLES } from 'lib/constants';
import useMessages from 'components/hooks/useMessages';

export function UserEditForm({
  userId,
  data,
  onSave,
}: {
  userId: string;
  data: any[];
  onSave: (data: any) => void;
}) {
  const { formatMessage, labels, messages } = useMessages();
  const { post, useMutation } = useApi();
  const { mutate, error } = useMutation({
    mutationFn: ({
      username,
      password,
      role,
    }: {
      username: string;
      password: string;
      role: string;
    }) => post(`/users/${userId}`, { username, password, role }),
  });

  const handleSubmit = async (data: any) => {
    mutate(data, {
      onSuccess: async () => {
        onSave(data);
      },
    });
  };

  const renderValue = value => {
    if (value === ROLES.user) {
      return formatMessage(labels.user);
    }
    if (value === ROLES.admin) {
      return formatMessage(labels.admin);
    }
    if (value === ROLES.viewOnly) {
      return formatMessage(labels.viewOnly);
    }
  };

  return (
    <Form onSubmit={handleSubmit} error={error} values={data} style={{ width: 300 }}>
      <FormRow label={formatMessage(labels.username)}>
        <FormInput name="username">
          <TextField />
        </FormInput>
      </FormRow>
      <FormRow label={formatMessage(labels.password)}>
        <FormInput
          name="password"
          rules={{
            minLength: { value: 8, message: formatMessage(messages.minPasswordLength, { n: 8 }) },
          }}
        >
          <PasswordField autoComplete="new-password" />
        </FormInput>
      </FormRow>
      <FormRow label={formatMessage(labels.role)}>
        <FormInput name="role" rules={{ required: formatMessage(labels.required) }}>
          <Dropdown renderValue={renderValue}>
            <Item key={ROLES.viewOnly}>{formatMessage(labels.viewOnly)}</Item>
            <Item key={ROLES.user}>{formatMessage(labels.user)}</Item>
            <Item key={ROLES.admin}>{formatMessage(labels.admin)}</Item>
          </Dropdown>
        </FormInput>
      </FormRow>
      <FormButtons>
        <SubmitButton variant="primary">{formatMessage(labels.save)}</SubmitButton>
      </FormButtons>
    </Form>
  );
}

export default UserEditForm;
