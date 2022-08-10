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
import Checkbox from 'components/common/Checkbox';
import { DOMAIN_REGEX } from 'lib/constants';
import useApi from 'hooks/useApi';

const initialValues = {
  name: '',
  domain: '',
  public: false,
};

const validate = ({ name, domain }) => {
  const errors = {};

  if (!name) {
    errors.name = <FormattedMessage id="label.required" defaultMessage="Required" />;
  }
  if (!domain) {
    errors.domain = <FormattedMessage id="label.required" defaultMessage="Required" />;
  } else if (!DOMAIN_REGEX.test(domain)) {
    errors.domain = <FormattedMessage id="label.invalid-domain" defaultMessage="Invalid domain" />;
  }

  return errors;
};

export default function WebsiteEditForm({ values, onSave, onClose }) {
  const { post } = useApi();
  const [message, setMessage] = useState();

  const handleSubmit = async values => {
    const { ok, data } = await post('/website', values);

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
        initialValues={{ ...initialValues, ...values, enable_share_url: !!values?.share_id }}
        validate={validate}
        onSubmit={handleSubmit}
      >
        {() => (
          <Form>
            <FormRow>
              <label htmlFor="name">
                <FormattedMessage id="label.name" defaultMessage="Name" />
              </label>
              <div>
                <Field name="name" type="text" />
                <FormError name="name" />
              </div>
            </FormRow>
            <FormRow>
              <label htmlFor="domain">
                <FormattedMessage id="label.domain" defaultMessage="Domain" />
              </label>
              <div>
                <Field name="domain" type="text" placeholder="example.com" />
                <FormError name="domain" />
              </div>
            </FormRow>
            <FormRow>
              <label />
              <Field name="enable_share_url">
                {({ field }) => (
                  <Checkbox
                    {...field}
                    label={
                      <FormattedMessage
                        id="label.enable-share-url"
                        defaultMessage="Enable share URL"
                      />
                    }
                  />
                )}
              </Field>
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
