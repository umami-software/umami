import {
  Button,
  Form,
  FormButtons,
  FormField,
  FormSubmitButton,
  ListItem,
  PasswordField,
  Select,
  TextField,
} from '@umami/react-zen';
import { useMessages, useUpdateQuery } from '@/components/hooks';
import { ROLES } from '@/lib/constants';

export function UserAddForm({ onSave, onClose }) {
  const { mutateAsync, error, isPending } = useUpdateQuery(`/users`);
  const { t, labels, messages, getErrorMessage } = useMessages();

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
        <Select>
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
      <FormButtons>
        <Button isDisabled={isPending} onPress={onClose}>
          {t(labels.cancel)}
        </Button>
        <FormSubmitButton variant="primary" data-test="button-submit" isDisabled={false}>
          {t(labels.save)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
