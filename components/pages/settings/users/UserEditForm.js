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
import { defineMessages, useIntl } from 'react-intl';
import useApi from 'hooks/useApi';
import { ROLES } from 'lib/constants';
import { labels } from 'components/messages';

const messages = defineMessages({
  username: { id: 'label.username', defaultMessage: 'Username' },

  password: { id: 'label.password', defaultMessage: 'Password' },
  role: { id: 'label.role', defaultMessage: 'Role' },
  user: { id: 'label.user', defaultMessage: 'User' },
  admin: { id: 'label.admin', defaultMessage: 'Admin' },
  minLength: {
    id: 'message.min-password-length',
    defaultMessage: 'Minimum length of 8 characters',
  },
});

export default function UserEditForm({ userId, data, onSave }) {
  const { formatMessage } = useIntl();
  const { post, useMutation } = useApi();
  const { mutate, error } = useMutation(({ username }) => post(`/users/${userId}`, { username }));

  const handleSubmit = async data => {
    mutate(data, {
      onSuccess: async () => {
        onSave(data);
      },
    });
  };

  const renderValue = value => {
    if (value === ROLES.user) {
      return formatMessage(messages.user);
    }
    if (value === ROLES.admin) {
      return formatMessage(messages.admin);
    }
  };

  return (
    <Form onSubmit={handleSubmit} error={error} values={data} style={{ width: 600 }}>
      <FormRow label={formatMessage(messages.username)}>
        <FormInput name="username">
          <TextField />
        </FormInput>
      </FormRow>
      <FormRow label={formatMessage(messages.password)}>
        <FormInput
          name="newPassword"
          rules={{
            minLength: { value: 8, message: formatMessage(messages.minLength) },
          }}
        >
          <PasswordField autoComplete="new-password" />
        </FormInput>
      </FormRow>
      <FormRow label={formatMessage(messages.role)}>
        <FormInput name="role" rules={{ required: formatMessage(labels.required) }}>
          <Dropdown renderValue={renderValue} style={{ width: 200 }}>
            <Item key={ROLES.user}>{formatMessage(messages.user)}</Item>
            <Item key={ROLES.admin}>{formatMessage(messages.admin)}</Item>
          </Dropdown>
        </FormInput>
      </FormRow>
      <FormButtons>
        <SubmitButton variant="primary">{formatMessage(labels.save)}</SubmitButton>
      </FormButtons>
    </Form>
  );
}
