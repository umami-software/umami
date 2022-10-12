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
import useApi from 'hooks/useApi';

const initialValues = {
  username: '',
  password: '',
};

const validate = ({ id, username, password }) => {
  const errors = {};

  if (!username) {
    errors.username = <FormattedMessage id="label.required" defaultMessage="Required" />;
  }
  if (!id && !password) {
    errors.password = <FormattedMessage id="label.required" defaultMessage="Required" />;
  }

  return errors;
};

export default function AccountEditForm({ values, onSave, onClose }) {
  const { post } = useApi();
  const [message, setMessage] = useState();

  const handleSubmit = async values => {
    const { id } = values;
    const { ok, data } = await post(id ? `/accounts/${id}` : '/accounts', values);

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
              <label htmlFor="username">
                <FormattedMessage id="label.username" defaultMessage="Username" />
              </label>
              <div>
                <Field name="username" type="text" />
                <FormError name="username" />
              </div>
            </FormRow>
            <FormRow>
              <label htmlFor="password">
                <FormattedMessage id="label.password" defaultMessage="Password" />
              </label>
              <div>
                <Field name="password" type="password" />
                <FormError name="password" />
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
