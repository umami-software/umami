import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Formik, Form, Field } from 'formik';
import Button from 'components/common/Button';
import FormLayout, {
  FormButtons,
  FormError,
  FormMessage,
  FormRow,
} from 'components/layout/FormLayout';
import usePost from 'hooks/usePost';

const initialValues = {
  current_password: '',
  new_password: '',
  confirm_password: '',
};

const validate = ({ current_password, new_password, confirm_password }) => {
  const errors = {};

  if (!current_password) {
    errors.current_password = <FormattedMessage id="label.required" defaultMessage="Required" />;
  }
  if (!new_password) {
    errors.new_password = <FormattedMessage id="label.required" defaultMessage="Required" />;
  }
  if (!confirm_password) {
    errors.confirm_password = <FormattedMessage id="label.required" defaultMessage="Required" />;
  } else if (new_password !== confirm_password) {
    errors.confirm_password = (
      <FormattedMessage id="label.passwords-dont-match" defaultMessage="Passwords don't match" />
    );
  }

  return errors;
};

export default function ChangePasswordForm({ values, onSave, onClose }) {
  const post = usePost();
  const [message, setMessage] = useState();

  const handleSubmit = async values => {
    const { ok, data } = await post('/api/account/password', values);

    if (ok) {
      onSave();
    } else {
      setMessage(
        data || <FormattedMessage id="message.failure" defaultMessage="Something went wrong." />,
      );
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
              <label htmlFor="current_password">
                <FormattedMessage id="label.current-password" defaultMessage="Current password" />
              </label>
              <div>
                <Field name="current_password" type="password" />
                <FormError name="current_password" />
              </div>
            </FormRow>
            <FormRow>
              <label htmlFor="new_password">
                <FormattedMessage id="label.new-password" defaultMessage="New password" />
              </label>
              <div>
                <Field name="new_password" type="password" />
                <FormError name="new_password" />
              </div>
            </FormRow>
            <FormRow>
              <label htmlFor="confirm_password">
                <FormattedMessage id="label.confirm-password" defaultMessage="Confirm password" />
              </label>
              <div>
                <Field name="confirm_password" type="password" />
                <FormError name="confirm_password" />
              </div>
            </FormRow>
            <FormButtons>
              <Button type="submit" variant="action">
                <FormattedMessage id="label.save" defaultMessage="Save" />
              </Button>
              <Button onClick={onClose}>
                <FormattedMessage id="label.cancel" defaultMessage="Cancel" />
              </Button>
            </FormButtons>
            <FormMessage>{message}</FormMessage>
          </Form>
        )}
      </Formik>
    </FormLayout>
  );
}
