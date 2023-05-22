import { useRef } from 'react';
import { Form, FormRow, FormInput, FormButtons, PasswordField, Button } from 'react-basics';
import useApi from 'hooks/useApi';
import useMessages from 'hooks/useMessages';

export function PasswordEditForm({ onSave, onClose }) {
  const { formatMessage, labels, messages } = useMessages();
  const { post, useMutation } = useApi();
  const { mutate, error, isLoading } = useMutation(data => post('/me/password', data));
  const ref = useRef(null);

  const handleSubmit = async data => {
    mutate(data, {
      onSuccess: async () => {
        onSave();
        onClose();
      },
    });
  };

  const samePassword = value => {
    if (value !== ref?.current?.getValues('newPassword')) {
      return formatMessage(messages.noMatchPassword);
    }
    return true;
  };

  return (
    <Form ref={ref} onSubmit={handleSubmit} error={error}>
      <FormRow label={formatMessage(labels.currentPassword)}>
        <FormInput name="currentPassword" rules={{ required: 'Required' }}>
          <PasswordField autoComplete="current-password" />
        </FormInput>
      </FormRow>
      <FormRow label={formatMessage(labels.newPassword)}>
        <FormInput
          name="newPassword"
          rules={{
            required: 'Required',
            minLength: { value: 8, message: formatMessage(messages.minPasswordLength, { n: 8 }) },
          }}
        >
          <PasswordField autoComplete="new-password" />
        </FormInput>
      </FormRow>
      <FormRow label={formatMessage(labels.confirmPassword)}>
        <FormInput
          name="confirmPassword"
          rules={{
            required: formatMessage(labels.required),
            minLength: { value: 8, message: formatMessage(messages.minPasswordLength, { n: 8 }) },
            validate: samePassword,
          }}
        >
          <PasswordField autoComplete="confirm-password" />
        </FormInput>
      </FormRow>
      <FormButtons flex>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {formatMessage(labels.save)}
        </Button>
        <Button onClick={onClose}>{formatMessage(labels.cancel)}</Button>
      </FormButtons>
    </Form>
  );
}

export default PasswordEditForm;
