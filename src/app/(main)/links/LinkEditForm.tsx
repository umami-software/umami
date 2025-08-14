import {
  Form,
  FormField,
  FormSubmitButton,
  Row,
  TextField,
  Button,
  Text,
  Label,
  Column,
  Icon,
  Loading,
} from '@umami/react-zen';
import { useConfig, useLinkQuery } from '@/components/hooks';
import { useMessages } from '@/components/hooks';
import { Refresh } from '@/components/icons';
import { getRandomChars } from '@/lib/crypto';
import { useUpdateQuery } from '@/components/hooks/queries/useUpdateQuery';

const generateId = () => getRandomChars(9);

export function LinkEditForm({
  linkId,
  teamId,
  onSave,
  onClose,
}: {
  linkId?: string;
  teamId?: string;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { formatMessage, labels } = useMessages();
  const { mutate, error, isPending } = useUpdateQuery('/links', { id: linkId, teamId });
  const { linkDomain } = useConfig();
  const { data, isLoading } = useLinkQuery(linkId);

  const handleSubmit = async (data: any) => {
    mutate(data, {
      onSuccess: async () => {
        onSave?.();
        onClose?.();
      },
    });
  };

  if (linkId && !isLoading) {
    return <Loading position="page" />;
  }

  return (
    <Form
      onSubmit={handleSubmit}
      error={error?.message}
      defaultValues={{ slug: generateId(), ...data }}
    >
      {({ setValue }) => {
        return (
          <>
            <FormField
              label={formatMessage(labels.name)}
              name="name"
              rules={{ required: formatMessage(labels.required) }}
            >
              <TextField autoComplete="off" />
            </FormField>

            <FormField
              label={formatMessage(labels.destinationUrl)}
              name="url"
              rules={{ required: formatMessage(labels.required) }}
            >
              <TextField placeholder="https://example.com" autoComplete="off" />
            </FormField>

            <Column>
              <Label>{formatMessage(labels.link)}</Label>
              <Row alignItems="center" gap>
                <Text>{linkDomain || window.location.origin}/</Text>
                <FormField
                  name="slug"
                  rules={{
                    required: formatMessage(labels.required),
                  }}
                  style={{ width: '100%' }}
                >
                  <TextField autoComplete="off" isReadOnly />
                </FormField>
                <Button
                  variant="quiet"
                  onPress={() => setValue('slug', generateId(), { shouldDirty: true })}
                >
                  <Icon>
                    <Refresh />
                  </Icon>
                </Button>
              </Row>
            </Column>

            <Row justifyContent="flex-end" paddingTop="3" gap="3">
              {onClose && (
                <Button isDisabled={isPending} onPress={onClose}>
                  {formatMessage(labels.cancel)}
                </Button>
              )}
              <FormSubmitButton isDisabled={false}>{formatMessage(labels.save)}</FormSubmitButton>
            </Row>
          </>
        );
      }}
    </Form>
  );
}
