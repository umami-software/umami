import {
  Dropdown,
  Item,
  Form,
  FormRow,
  FormButtons,
  FormInput,
  TextField,
  PasswordField,
  SubmitButton,
} from 'react-basics';
import { useIntl, defineMessages } from 'react-intl';
import useApi from 'hooks/useApi';
import { ROLES } from 'lib/constants';

const messages = defineMessages({
  username: { id: 'label.username', defaultMessage: 'Username' },
  password: { id: 'label.password', defaultMessage: 'Password' },
  role: { id: 'label.role', defaultMessage: 'Role' },
  user: { id: 'label.user', defaultMessage: 'User' },
  admin: { id: 'label.admin', defaultMessage: 'Admin' },
  save: { id: 'label.save', defaultMessage: 'Save' },
  cancel: { id: 'label.cancel', defaultMessage: 'Cancel' },
  required: { id: 'label.required', defaultMessage: 'Required' },
});

export default function UserAddForm({ onSave }) {
  const { post, useMutation } = useApi();
  const { mutate, error } = useMutation(data => post(`/users`, data));
  const { formatMessage } = useIntl();

  const handleSubmit = async data => {
    mutate(data, {
      onSuccess: async () => {
        onSave(data);
      },
    });
  };

  return (
    <Form onSubmit={handleSubmit} error={error}>
      <FormRow label={formatMessage(messages.username)}>
        <FormInput name="username" rules={{ required: formatMessage(messages.required) }}>
          <TextField />
        </FormInput>
      </FormRow>
      <FormRow label={formatMessage(messages.password)}>
        <FormInput name="password" rules={{ required: formatMessage(messages.required) }}>
          <PasswordField />
        </FormInput>
      </FormRow>
      <FormRow label={formatMessage(messages.role)}>
        <FormInput name="role" rules={{ required: formatMessage(messages.required) }}>
          <Dropdown style={{ width: 200 }}>
            <Item key={ROLES.user}>{formatMessage(messages.user)}</Item>
            <Item key={ROLES.admin}>{formatMessage(messages.admin)}</Item>
          </Dropdown>
        </FormInput>
      </FormRow>
      <FormButtons>
        <SubmitButton variant="primary">{formatMessage(messages.save)}</SubmitButton>
      </FormButtons>
    </Form>
  );
}
