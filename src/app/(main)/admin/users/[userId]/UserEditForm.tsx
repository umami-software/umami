import {
  Form,
  FormButtons,
  FormField,
  FormSubmitButton,
  PasswordField,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TextField,
} from '@umami/react-zen';
import { useLoginQuery, useMessages, useUpdateQuery, useUser } from '@/components/hooks';
import { ROLES } from '@/lib/constants';

export function UserEditForm({ userId, onSave }: { userId: string; onSave?: () => void }) {
  const { t, labels, messages, getErrorMessage } = useMessages();
  const user = useUser();
  const { user: login } = useLoginQuery();

  const { mutateAsync, error, toast, touch } = useUpdateQuery(`/users/${userId}`);

  const roles = [
    { value: ROLES.viewOnly, label: t(labels.viewOnly), test: 'viewOnly' },
    { value: ROLES.user, label: t(labels.user), test: 'user' },
    { value: ROLES.admin, label: t(labels.admin), test: 'admin' },
  ];

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
          <Select items={roles} defaultValue={user.role}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              {roles.map(({ value, label, test }) => (
                <SelectItem key={value} value={value} data-test={`dropdown-item-${test}`}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      )}
      <FormButtons>
        <FormSubmitButton data-test="button-submit">{t(labels.save)}</FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
