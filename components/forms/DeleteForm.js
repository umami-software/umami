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

const CONFIRMATION_WORD = 'DELETE';

const validate = ({ confirmation }) => {
  const errors = {};

  if (confirmation !== CONFIRMATION_WORD) {
    errors.confirmation = !confirmation ? (
      <FormattedMessage id="label.required" defaultMessage="Required" />
    ) : (
      <FormattedMessage id="label.invalid" defaultMessage="Invalid" />
    );
  }

  return errors;
};

export default function DeleteForm({ values, onSave, onClose }) {
  const { del } = useApi();
  const [message, setMessage] = useState();

  const handleSubmit = async ({ type, id }) => {
    const { ok, data } = await del(`/${type}/${id}`);

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
        initialValues={{ confirmation: '', ...values }}
        validate={validate}
        onSubmit={handleSubmit}
      >
        {props => (
          <Form>
            <div>
              <FormattedMessage
                id="message.confirm-delete"
                defaultMessage="Are your sure you want to delete {target}?"
                values={{ target: <b>{values.name}</b> }}
              />
            </div>
            <div>
              <FormattedMessage
                id="message.delete-warning"
                defaultMessage="All associated data will be deleted as well."
              />
            </div>
            <p>
              <FormattedMessage
                id="message.type-delete"
                defaultMessage="Type {delete} in the box below to confirm."
                values={{ delete: <b>{CONFIRMATION_WORD}</b> }}
              />
            </p>
            <FormRow>
              <div>
                <Field name="confirmation" type="text" />
                <FormError name="confirmation" />
              </div>
            </FormRow>
            <FormButtons>
              <Button
                type="submit"
                variant="danger"
                disabled={props.values.confirmation !== CONFIRMATION_WORD}
              >
                <FormattedMessage id="label.delete" defaultMessage="Delete" />
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
