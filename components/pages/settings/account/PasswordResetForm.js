import { useRef } from 'react';
import { Form, FormRow, FormInput, FormButtons, PasswordField, SubmitButton } from 'react-basics';
import useApi from 'hooks/useApi';

export default function PasswordResetForm({ token, onSave }) {
  const { post, useMutation } = useApi();
  const { mutate, error } = useMutation(data =>
    post('/accounts/reset-password', { ...data, token }),
  );
  const ref = useRef(null);

  const handleSubmit = async data => {
    mutate(data, {
      onSuccess: async () => {
        onSave();
      },
    });
  };

  const samePassword = value => {
    if (value !== ref?.current?.getValues('newPassword')) {
      return "Passwords don't match";
    }
    return true;
  };

  return (
    <>
      <Form ref={ref} onSubmit={handleSubmit} error={error}>
        <h2>Reset your password</h2>
        <FormRow label="New password">
          <FormInput name="newPassword" rules={{ required: 'Required' }}>
            <PasswordField autoComplete="off" />
          </FormInput>
        </FormRow>
        <FormRow label="Confirm password">
          <FormInput
            name="confirmPassword"
            rules={{ required: 'Required', validate: samePassword }}
          >
            <PasswordField autoComplete="off" />
          </FormInput>
        </FormRow>
        <FormButtons align="center">
          <SubmitButton variant="primary">Update password</SubmitButton>
        </FormButtons>
      </Form>
    </>
  );
}
