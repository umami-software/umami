import {
  Box,
  Button,
  Code,
  Form,
  FormField,
  FormSubmitButton,
  Label,
  ListItem,
  Row,
  Select,
  TextField,
} from '@umami/react-zen';
import { CopyButton } from '@/components/common/CopyButton';
import { useBillingQuery, useLoginQuery, useMessages, useUpdateQuery } from '@/components/hooks';
import { BILLING_PROVIDER_TYPES } from '@/lib/constants';

interface BillingsFormValues {
  name: string;
  provider: string;
  apiKey: string;
  webhookId: string;
  webhookSecret: string;
}

export function BillingsEditForm({
  billingId,
  providerName,
  displayName,
  onSave,
  onClose,
}: {
  billingId?: string;
  providerName?: string;
  displayName?: string;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { t, labels, messages, getErrorMessage } = useMessages();
  const { user } = useLoginQuery();
  const { data: billing } = useBillingQuery(billingId);
  const { mutateAsync, error, isPending, touch, toast } = useUpdateQuery(
    billingId ? `/billing/${billingId}` : '/billing',
    billingId ? undefined : { userId: user?.id },
  );

  const handleSubmit = async (data: BillingsFormValues) => {
    await mutateAsync({
      name: data.name,
      provider: data.provider,
      apiKey: data.apiKey || undefined,
      webhookId: data.webhookId || undefined,
      webhookSecret: data.webhookSecret || undefined,
    });
    toast(t(messages.saved));
    touch('billingProviders');
    touch(`billing:${billingId}`);
    onSave?.();
    onClose?.();
  };

  return (
    <Form
      onSubmit={handleSubmit}
      error={getErrorMessage(error)}
      values={{
        name: displayName ?? '',
        provider: providerName ?? BILLING_PROVIDER_TYPES.stripe,
        apiKey: '',
        webhookId: billing?.webhookId ?? '',
        webhookSecret: '',
      }}
    >
      {({ watch, setValue }) => {
        const provider = watch('provider') as string;

        return (
          <>
            {billingId && (
              <Box paddingBottom="3">
                <Label>{t(labels.id)}</Label>
                <Row alignItems="center" gap="2">
                  <Code>{billingId}</Code>
                  <CopyButton value={billingId} label="Copy ID" />
                </Row>
              </Box>
            )}
            <FormField name="name" label={t(labels.name)} rules={{ required: t(labels.required) }}>
              <TextField autoComplete="off" autoFocus placeholder={t(labels.untitled)} />
            </FormField>
            <FormField
              name="provider"
              label={t(labels.provider)}
              rules={{ required: t(labels.required) }}
            >
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
              description={billingId ? t(messages.keepCurrentValue) : undefined}
              rules={billingId ? undefined : { required: t(labels.required) }}
            >
              <TextField
                autoComplete="off"
                type="password"
                placeholder={billing?.keyPreview || 'sk_live_...'}
              />
            </FormField>
            <FormField name="webhookId" label={t(labels.webhookId)}>
              <TextField autoComplete="off" placeholder="we_..." />
            </FormField>
            <FormField
              name="webhookSecret"
              label={t(labels.webhookSecret)}
              description={billing?.webhookSecretPreview ? t(messages.keepCurrentValue) : undefined}
            >
              <TextField
                autoComplete="off"
                type="password"
                placeholder={billing?.webhookSecretPreview || 'whsec_...'}
              />
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
