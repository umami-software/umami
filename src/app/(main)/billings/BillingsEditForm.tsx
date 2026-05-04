import { Box, Button, Form, FormField, FormSubmitButton, ListItem, Row, Select, TextField } from '@umami/react-zen';
import { useLoginQuery, useMessages, useUpdateQuery } from '@/components/hooks';
import { BILLING_PROVIDER_TYPES } from '@/lib/constants';

interface BillingsFormValues {
  name: string;
  provider: string;
  apiKey: string;
}

export function BillingsEditForm({
  providerId,
  providerName,
  displayName,
  onSave,
  onClose,
}: {
  providerId?: string;
  providerName?: string;
  displayName?: string;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { t, labels, messages, getErrorMessage } = useMessages();
  const { user } = useLoginQuery();
  const { mutateAsync, error, isPending, touch, toast } = useUpdateQuery(
    providerId ? `/billing/providers/${providerId}` : '/billing/providers',
    providerId ? undefined : { userId: user?.id },
  );

  const handleSubmit = async (data: BillingsFormValues) => {
    await mutateAsync({ name: data.name, provider: data.provider, apiKey: data.apiKey || undefined });
    toast(t(messages.saved));
    touch('billingProviders');
    onSave?.();
    onClose?.();
  };

  return (
    <Form
      onSubmit={handleSubmit}
      error={getErrorMessage(error)}
      values={{ name: displayName ?? '', provider: providerName ?? BILLING_PROVIDER_TYPES.stripe, apiKey: '' }}
    >
      {({ watch, setValue }) => {
        const provider = watch('provider') as string;

        return (
          <>
            <FormField name="name" label={t(labels.name)} rules={{ required: t(labels.required) }}>
              <TextField autoComplete="off" autoFocus placeholder={t(labels.untitled)} />
            </FormField>
            <FormField name="provider" label={t(labels.provider)} rules={{ required: t(labels.required) }}>
              <Box width="100%" maxWidth="360px">
                <Select
                  value={provider}
                  onChange={value => setValue('provider', value, { shouldDirty: true })}
                >
                  {Object.values(BILLING_PROVIDER_TYPES).map(type => (
                    <ListItem key={type} id={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </ListItem>
                  ))}
                </Select>
              </Box>
            </FormField>
            <FormField
              name="apiKey"
              label={t(labels.apiKey)}
              rules={providerId ? undefined : { required: t(labels.required) }}
            >
              <TextField autoComplete="off" type="password" placeholder="sk_live_..." />
            </FormField>
            <Row justifyContent="flex-end" paddingTop="3" gap="3">
              {onClose && (
                <Button isDisabled={isPending} onPress={onClose}>
                  {t(labels.cancel)}
                </Button>
              )}
              <FormSubmitButton isDisabled={isPending}>{t(labels.save)}</FormSubmitButton>
            </Row>
          </>
        );
      }}
    </Form>
  );
}
