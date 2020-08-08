import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { post } from 'lib/web';
import Button from 'components/interface/Button';
import FormLayout, {
  FormButtons,
  FormError,
  FormMessage,
  FormRow,
} from 'components/layout/FormLayout';

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

export default function WebsiteEditForm({ initialValues, onSave, onClose }) {
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
      <Formik initialValues={initialValues} validate={validate} onSubmit={handleSubmit}>
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
