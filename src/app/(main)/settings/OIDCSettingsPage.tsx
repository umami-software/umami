'use client';
import {
  Form,
  FormRow,
  FormInput,
  FormButtons,
  TextField,
  PasswordField,
  SubmitButton,
} from 'react-basics';
import PageHeader from '@/components/layout/PageHeader';
import { useApi, useMessages } from '@/components/hooks';
import { useEffect, useState, useRef } from 'react';

export default function OIDCSettingsPage() {
  const { get, post, useMutation } = useApi();
  const { formatMessage, labels } = useMessages();
  const [values, setValues] = useState<any>({});
  const ref = useRef(null);
  const { mutate, error, isPending } = useMutation({
    mutationFn: (data: any) => post('/admin/oidc', data),
  });

  useEffect(() => {
    (async () => {
      try {
        const cfg = await get('/admin/oidc');
        setValues(cfg || {});
      } catch (e) {
        // ignore load errors; form will remain empty
      }
    })();
  }, [get]);

  const handleSubmit = (data: any) => {
    mutate(data, {
      onSuccess: async () => {
        ref.current?.reset?.(data);
      },
    });
  };

  return (
    <>
      <PageHeader title="OIDC" />
      <Form ref={ref} onSubmit={handleSubmit} values={values} error={error}>
        <FormRow label="Issuer URL">
          <FormInput name="issuerUrl" rules={{ required: formatMessage(labels.required) }}>
            <TextField />
          </FormInput>
        </FormRow>
        <FormRow label="Client ID">
          <FormInput name="clientId" rules={{ required: formatMessage(labels.required) }}>
            <TextField />
          </FormInput>
        </FormRow>
        <FormRow label="Client Secret">
          <FormInput name="clientSecret">
            <PasswordField />
          </FormInput>
        </FormRow>
        <FormRow label="Redirect URI">
          <FormInput name="redirectUri" rules={{ required: formatMessage(labels.required) }}>
            <TextField />
          </FormInput>
        </FormRow>
        <FormRow label="Scopes">
          <FormInput name="scopes">
            <TextField placeholder="openid profile email" />
          </FormInput>
        </FormRow>
        <FormRow label="Username claim">
          <FormInput name="usernameClaim">
            <TextField placeholder="preferred_username" />
          </FormInput>
        </FormRow>
        <FormButtons>
          <SubmitButton variant="primary" disabled={isPending}>
            {formatMessage(labels.save)}
          </SubmitButton>
        </FormButtons>
      </Form>
    </>
  );
}
