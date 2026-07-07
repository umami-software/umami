import { Button, Form, FormField, FormSubmitButton, Row, TextField } from '@umami/react-zen';
import { useMessages, useUpdateQuery } from '@/components/hooks';
import { WebsiteGroupParentSelectField } from '@/components/input/WebsiteGroupSelect';

export function WebsiteGroupAddForm({
  teamId,
  parentId,
  onSave,
  onClose,
}: {
  teamId?: string;
  parentId?: string | null;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { t, labels } = useMessages();
  const { mutateAsync, error, isPending } = useUpdateQuery('/website-groups', { teamId });

  const handleSubmit = async (data: any) => {
    await mutateAsync(
      {
        ...data,
        parentId: data.parentId || parentId || null,
        teamId: teamId ?? null,
      },
      {
        onSuccess: async () => {
          onSave?.();
          onClose?.();
        },
      },
    );
  };

  return (
    <Form
      onSubmit={handleSubmit}
      error={error?.message}
      defaultValues={{ parentId: parentId ?? '', name: '' }}
    >
      <FormField
        label={t(labels.name)}
        data-test="input-group-name"
        name="name"
        rules={{ required: t(labels.required) }}
      >
        <TextField autoComplete="off" />
      </FormField>
      {!parentId && <WebsiteGroupParentSelectField teamId={teamId} />}
      <Row justifyContent="flex-end" paddingTop="3" gap="3">
        {onClose && (
          <Button isDisabled={isPending} onPress={onClose}>
            {t(labels.cancel)}
          </Button>
        )}
        <FormSubmitButton data-test="button-submit-group" isDisabled={false}>
          {t(labels.save)}
        </FormSubmitButton>
      </Row>
    </Form>
  );
}
