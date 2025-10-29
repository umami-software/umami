import {
  Select,
  ListItem,
  Form,
  FormField,
  FormButtons,
  TextField,
  FormSubmitButton,
  PasswordField,
} from '@umami/react-zen';
import { useLoginQuery, useMessages, useUpdateQuery, useUser } from '@/components/hooks';
import { ROLES } from '@/lib/constants';

export function UserEditForm({ userId, onSave }: { userId: string; onSave?: () => void }) {
  const { formatMessage, labels, messages, getMessage } = useMessages();
  const user = useUser();
  const { user: login } = useLoginQuery();

  const { mutateAsync, error, toast, touch } = useUpdateQuery(`/users/${userId}`);

  const handleSubmit = async (data: any) => {
    await mutateAsync(data, {
      onSuccess: async () => {
        toast(formatMessage(messages.saved));
        touch('users');
        touch(`user:${user.id}`);
        onSave?.();
      },
    });
  };

  return (
    <Form onSubmit={handleSubmit} error={getMessage(error?.['code'])} values={user}>
      <FormField name="username" label={formatMessage(labels.username)}>
        <TextField data-test="input-username" />
      </FormField>
      <FormField
        name="password"
        label={formatMessage(labels.password)}
        rules={{
          minLength: { value: 8, message: formatMessage(messages.minPasswordLength, { n: '8' }) },
        }}
      >
        <PasswordField autoComplete="new-password" data-test="input-password" />
      </FormField>

      {user.id !== login.id && (
        <FormField
          name="role"
          label={formatMessage(labels.role)}
          rules={{ required: formatMessage(labels.required) }}
        >
          <Select defaultSelectedKey={user.role}>
            <ListItem id={ROLES.viewOnly} data-test="dropdown-item-viewOnly">
              {formatMessage(labels.viewOnly)}
            </ListItem>
            <ListItem id={ROLES.user} data-test="dropdown-item-user">
              {formatMessage(labels.user)}
            </ListItem>
            <ListItem id={ROLES.admin} data-test="dropdown-item-admin">
              {formatMessage(labels.admin)}
            </ListItem>
          </Select>
        </FormField>
      )}
      <FormButtons>
        <FormSubmitButton data-test="button-submit" variant="primary">
          {formatMessage(labels.save)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
