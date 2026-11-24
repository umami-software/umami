import {
  Button,
  Form,
  FormButtons,
  FormField,
  FormSubmitButton,
  PasswordField,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TextField,
} from '@umami/react-zen';
import { useMessages, useUpdateQuery } from '@/components/hooks';
import { ROLES } from '@/lib/constants';

export function UserAddForm({ onSave, onClose }) {
  const { mutateAsync, error, isPending } = useUpdateQuery(`/users`);
  const { t, labels, messages, getErrorMessage } = useMessages();

  const roles = [
    { value: ROLES.viewOnly, label: t(labels.viewOnly), test: 'viewOnly' },
    { value: ROLES.user, label: t(labels.user), test: 'user' },
    { value: ROLES.admin, label: t(labels.admin), test: 'admin' },
  ];

  const handleSubmit = async (data: any) => {
    await mutateAsync(data, {
      onSuccess: async () => {
        onSave(data);
        onClose();
      },
    });
  };

  return (
    <Form onSubmit={handleSubmit} error={getErrorMessage(error)}>
      <FormField
        label={t(labels.username)}
        name="username"
        rules={{ required: t(labels.required) }}
      >
        <TextField autoComplete="new-username" data-test="input-username" />
      </FormField>
      <FormField
        label={t(labels.password)}
        name="password"
        rules={{
          required: t(labels.required),
          minLength: { value: 8, message: t(messages.minPasswordLength, { n: '8' }) },
        }}
      >
        <PasswordField autoComplete="new-password" data-test="input-password" />
      </FormField>
      <FormField label={t(labels.role)} name="role" rules={{ required: t(labels.required) }}>
        <Select items={roles}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectGroup>
              {roles.map(({ value, label, test }) => (
                <SelectItem key={value} value={value} data-test={`dropdown-item-${test}`}>
                  {label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </FormField>
      <FormButtons>
        <Button variant="secondary" disabled={isPending} onClick={onClose}>
          {t(labels.cancel)}
        </Button>
        <FormSubmitButton data-test="button-submit" disabled={false}>
          {t(labels.save)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
