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
import Checkbox from '../common/Checkbox';

const initialValues = {
  name: '',
  domain: '',
  public: false,
};

const validate = ({ name, domain }) => {
  const errors = {};

  if (!name) {
    errors.name = 'Required';
  }
  if (!domain) {
    errors.domain = 'Required';
  }

  return errors;
};

export default function WebsiteEditForm({ values, onSave, onClose }) {
  const [message, setMessage] = useState();

  const handleSubmit = async values => {
    const response = await post(`/api/website`, values);

    if (typeof response !== 'string') {
      onSave();
    } else {
      setMessage('Something went wrong');
    }
  };

  return (
    <FormLayout>
      <Formik
        initialValues={{ ...initialValues, ...values, enable_share_url: !!values?.share_id }}
        validate={validate}
        onSubmit={handleSubmit}
      >
        {() => (
          <Form>
            <FormRow>
              <label htmlFor="name">Name</label>
              <Field name="name" type="text" />
              <FormError name="name" />
            </FormRow>
            <FormRow>
              <label htmlFor="domain">Domain</label>
              <Field name="domain" type="text" />
              <FormError name="domain" />
            </FormRow>
            <FormRow>
              <label></label>
              <Field name="enable_share_url">
                {({ field }) => <Checkbox {...field} label="Enable share URL" />}
              </Field>
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
