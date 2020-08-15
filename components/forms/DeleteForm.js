import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { del } from 'lib/web';
import Button from 'components/common/Button';
import FormLayout, {
  FormButtons,
  FormError,
  FormMessage,
  FormRow,
} from 'components/layout/FormLayout';

const validate = ({ confirmation }) => {
  const errors = {};

  if (confirmation !== 'DELETE') {
    errors.confirmation = !confirmation ? 'Required' : 'Invalid';
  }

  return errors;
};

export default function DeleteForm({ values, onSave, onClose }) {
  const [message, setMessage] = useState();

  const handleSubmit = async ({ type, id }) => {
    const response = await del(`/api/${type}/${id}`);

    if (typeof response !== 'string') {
      onSave();
    } else {
      setMessage('Something went wrong');
    }
  };

  return (
    <FormLayout>
      <Formik
        initialValues={{ confirmation: '', ...values }}
        validate={validate}
        onSubmit={handleSubmit}
      >
        {() => (
          <Form>
            <div>
              Are your sure you want to delete <b>{values.name}</b>?
            </div>
            <div>All associated data will be deleted as well.</div>
            <p>
              Type <b>DELETE</b> in the box below to confirm.
            </p>
            <FormRow>
              <Field name="confirmation" type="text" />
              <FormError name="confirmation" />
            </FormRow>
            <FormButtons>
              <Button type="submit" variant="danger">
                Delete
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
