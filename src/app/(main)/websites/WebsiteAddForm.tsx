import { Button, Form, FormField, FormSubmitButton, Row, TextField } from '@umami/react-zen';
import { useMessages, useModified, useUpdateQuery } from '@/components/hooks';
import { WebsiteGroupSelectField } from '@/components/input/WebsiteGroupSelect';
import { DOMAIN_REGEX } from '@/lib/constants';

export function WebsiteAddForm({
  teamId,
  onSave,
  onClose,
}: {
  teamId?: string;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { t, labels, messages } = useMessages();
  const { mutateAsync, error, isPending } = useUpdateQuery('/websites', { teamId });
  const { touch } = useModified();

  const handleSubmit = async (data: any) => {
    await mutateAsync(
      {
        ...data,
        groupId: data.groupId || null,
      },
      {
        onSuccess: async () => {
          touch('websites');
          touch('website-groups');
          onSave?.();
          onClose?.();
        },
      },
    );
  };

  return (
    <Form onSubmit={handleSubmit} error={error?.message}>
      <FormField
        label={t(labels.name)}
        data-test="input-name"
        name="name"
        rules={{ required: t(labels.required) }}
      >
        <TextField autoComplete="off" />
      </FormField>

      <FormField
        label={t(labels.domain)}
        data-test="input-domain"
        name="domain"
        rules={{
          required: t(labels.required),
          pattern: { value: DOMAIN_REGEX, message: t(messages.invalidDomain) },
        }}
      >
        <TextField autoComplete="off" />
      </FormField>
      <WebsiteGroupSelectField teamId={teamId} />
      <Row justifyContent="flex-end" paddingTop="3" gap="3">
        {onClose && (
          <Button isDisabled={isPending} onPress={onClose}>
            {t(labels.cancel)}
          </Button>
        )}
        <FormSubmitButton data-test="button-submit" isDisabled={false}>
          {t(labels.save)}
        </FormSubmitButton>
      </Row>
    </Form>
  );
}
