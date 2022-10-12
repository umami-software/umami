import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Formik, Form, Field, useFormikContext } from 'formik';
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
import useFetch from 'hooks/useFetch';
import useUser from 'hooks/useUser';
import styles from './WebsiteEditForm.module.css';

const initialValues = {
  name: '',
  domain: '',
  owner: '',
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

const OwnerDropDown = ({ user, accounts }) => {
  const { setFieldValue, values } = useFormikContext();

  useEffect(() => {
    if (values.userId != null && values.owner === '') {
      setFieldValue('owner', values.userId.toString());
    } else if (user?.id && values.owner === '') {
      setFieldValue('owner', user.id.toString());
    }
  }, [accounts, setFieldValue, user, values]);

  if (user?.isAdmin) {
    return (
      <FormRow>
        <label htmlFor="owner">
          <FormattedMessage id="label.owner" defaultMessage="Owner" />
        </label>
        <div>
          <Field as="select" name="owner" className={styles.dropdown}>
            {accounts?.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.username}
              </option>
            ))}
          </Field>
          <FormError name="owner" />
        </div>
      </FormRow>
    );
  } else {
    return null;
  }
};

export default function WebsiteEditForm({ values, onSave, onClose }) {
  const { post } = useApi();
  const { data: accounts } = useFetch(`/accounts`);
  const { user } = useUser();
  const [message, setMessage] = useState();

  const handleSubmit = async values => {
    const { id: websiteId } = values;

    const { ok, data } = await post(websiteId ? `/websites/${websiteId}` : '/websites', values);

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
        initialValues={{ ...initialValues, ...values, enableShareUrl: !!values?.shareId }}
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
                <Field
                  name="domain"
                  type="text"
                  placeholder="example.com"
                  spellCheck="false"
                  autoCapitalize="off"
                  autoCorrect="off"
                />
                <FormError name="domain" />
              </div>
            </FormRow>
            <OwnerDropDown accounts={accounts} user={user} />
            <FormRow>
              <label />
              <Field name="enableShareUrl">
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
