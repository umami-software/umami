import {
  Form,
  FormButtons,
  FormField,
  FormSubmitButton,
  ListItem,
  PasswordField,
  Select,
  TextField,
} from '@umami/react-zen';
import { useLoginQuery, useMessages, useUpdateQuery, useUser } from '@/components/hooks';
import { ROLES } from '@/lib/constants';

export function UserEditForm({ userId, onSave }: { userId: string; onSave?: () => void }) {
  const { t, labels, messages, getErrorMessage } = useMessages();
  const user = useUser();
  const { user: login } = useLoginQuery();

  const { mutateAsync, error, toast, touch } = useUpdateQuery(`/users/${userId}`);

  const handleSubmit = async (data: any) => {
    await mutateAsync(data, {
      onSuccess: async () => {
        toast(t(messages.saved));
        touch('users');
        touch(`user:${user.id}`);
        onSave?.();
      },
    });
  };

  return (
    <Form onSubmit={handleSubmit} error={getErrorMessage(error)} values={user}>
      <FormField name="username" label={t(labels.username)}>
        <TextField data-test="input-username" />
      </FormField>
      <FormField
        name="password"
        label={t(labels.password)}
        rules={{
          minLength: { value: 8, message: t(messages.minPasswordLength, { n: '8' }) },
        }}
      >
        <PasswordField autoComplete="new-password" data-test="input-password" />
      </FormField>

      {user.id !== login.id && (
        <FormField name="role" label={t(labels.role)} rules={{ required: t(labels.required) }}>
          <Select defaultValue={user.role}>
            <ListItem id={ROLES.viewOnly} data-test="dropdown-item-viewOnly">
              {t(labels.viewOnly)}
            </ListItem>
            <ListItem id={ROLES.user} data-test="dropdown-item-user">
              {t(labels.user)}
            </ListItem>
            <ListItem id={ROLES.admin} data-test="dropdown-item-admin">
              {t(labels.admin)}
            </ListItem>
          </Select>
        </FormField>
      )}
      <FormButtons>
        <FormSubmitButton data-test="button-submit" variant="primary">
          {t(labels.save)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
