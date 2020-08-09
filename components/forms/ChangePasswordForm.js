import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { post } from 'lib/web';
import Button from 'components/common/Button';
import FormLayout, {
  FormButtons,
  FormError,
  FormMessage,
  FormRow,
} from 'components/layout/FormLayout';

const initialValues = {
  password: '',
  newPassword: '',
  defaultPassword: '',
};

const validate = ({ password, newPassword, confirmPassword }) => {
  const errors = {};

  if (!password) {
    errors.password = 'Required';
  }
  if (!newPassword) {
    errors.newPassword = 'Required';
  }
  if (!confirmPassword) {
    errors.confirmPassword = 'Required';
  } else if (newPassword !== confirmPassword) {
    errors.confirmPassword = `Passwords don't match`;
  }

  return errors;
};

export default function ChangePasswordForm({ values, onSave, onClose }) {
  const [message, setMessage] = useState();

  const handleSubmit = async values => {
    const response = await post(`/api/website`, values);

    if (response) {
      onSave();
    } else {
      setMessage('Something went wrong.');
    }
  };

  return (
    <FormLayout>
      <Formik
        initialValues={{ ...initialValues, ...values }}
        validate={validate}
        onSubmit={handleSubmit}
      >
        {() => (
          <Form>
            <FormRow>
              <label htmlFor="password">Current password</label>
              <Field name="password" type="password" />
              <FormError name="password" />
            </FormRow>
            <FormRow>
              <label htmlFor="newPassword">New password</label>
              <Field name="newPassword" type="password" />
              <FormError name="newPassword" />
            </FormRow>
            <FormRow>
              <label htmlFor="confirmPassword">Confirm password</label>
              <Field name="confirmPassword" type="password" />
              <FormError name="confirmPassword" />
            </FormRow>
            <FormButtons>
              <Button type="submit" variant="action">
                Save
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </FormButtons>
            <FormMessage>{message}</FormMessage>
          </Form>
        )}
      </Formik>
    </FormLayout>
  );
}
