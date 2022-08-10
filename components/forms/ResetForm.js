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

const CONFIRMATION_WORD = 'RESET';

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

export default function ResetForm({ values, onSave, onClose }) {
  const { post } = useApi();
  const [message, setMessage] = useState();

  const handleSubmit = async ({ type, id }) => {
    const { ok, data } = await post(`/${type}/${id}/reset`);

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
                id="message.confirm-reset"
                defaultMessage="Are your sure you want to reset {target}'s statistics?"
                values={{ target: <b>{values.name}</b> }}
              />
            </div>
            <div>
              <FormattedMessage
                id="message.reset-warning"
                defaultMessage="All statistics for this website will be deleted, but your tracking code will remain intact."
              />
            </div>
            <p>
              <FormattedMessage
                id="message.type-reset"
                defaultMessage="Type {reset} in the box below to confirm."
                values={{ reset: <b>{CONFIRMATION_WORD}</b> }}
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
                <FormattedMessage id="label.reset" defaultMessage="Reset" />
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
