import {
  Button,
  Column,
  Form,
  FormButtons,
  FormField,
  FormSubmitButton,
  Loading,
  Text,
  TextField,
} from '@umami/react-zen';
import { useEffect, useState } from 'react';
import { useMessages, useUpdateQuery, useWebsiteSegmentQuery } from '@/components/hooks';
import { FieldFilters } from '@/components/input/FieldFilters';
import { PropertyFilters } from '@/components/property-data/PropertyFilters';
import type { SessionPropertyFilter } from '@/lib/types';

export function SegmentEditForm({
  segmentId,
  websiteId,
  filters = [],
  sessionPropertyFilters = [],
  showFilters = true,
  onSave,
  onClose,
}: {
  segmentId?: string;
  websiteId: string;
  filters?: any[];
  sessionPropertyFilters?: SessionPropertyFilter[];
  showFilters?: boolean;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { data } = useWebsiteSegmentQuery(websiteId, segmentId);
  const { t, labels, messages, getErrorMessage } = useMessages();
  const [currentMatch, setCurrentMatch] = useState<string>('all');

  useEffect(() => {
    setCurrentMatch((data?.parameters as any)?.match || 'all');
  }, [data]);

  const { mutateAsync, error, isPending, touch, toast } = useUpdateQuery(
    `/websites/${websiteId}/segments${segmentId ? `/${segmentId}` : ''}`,
    {
      type: 'segment',
    },
  );

  const handleSubmit = async (formData: any) => {
    await mutateAsync(
      {
        ...formData,
        parameters: {
          ...formData.parameters,
          match: currentMatch !== 'all' ? currentMatch : undefined,
        },
      },
      {
        onSuccess: async () => {
          toast(t(messages.saved));
          touch('segments');
          onSave?.();
          onClose?.();
        },
      },
    );
  };

  if (segmentId && !data) {
    return <Loading placement="absolute" />;
  }

  return (
    <Form
      onSubmit={handleSubmit}
      defaultValues={data || { name: '', parameters: { filters, sessionPropertyFilters } }}
      error={getErrorMessage(error)}
    >
      <Column gap="4">
        <FormField name="name" label={t(labels.name)} rules={{ required: t(labels.required) }}>
          <TextField autoFocus={!segmentId} />
        </FormField>
        {showFilters && (
          <Column gap="4">
            <Column gap="1">
              <Text weight="bold">{t(labels.filters)}</Text>
              <FormField name="parameters.filters">
                <FieldFilters
                  websiteId={websiteId}
                  match={currentMatch}
                  onMatchChange={setCurrentMatch}
                />
              </FormField>
            </Column>

            <Column gap="1">
              <Text weight="bold">{t(labels.sessionData)}</Text>
              <FormField name="parameters.sessionPropertyFilters">
                {({ field }) => (
                  <PropertyFilters
                    source="session"
                    websiteId={websiteId}
                    value={field.value ?? []}
                    onChange={field.onChange}
                  />
                )}
              </FormField>
            </Column>
          </Column>
        )}
        <FormButtons>
          <Button isDisabled={isPending} onPress={onClose}>
            {t(labels.cancel)}
          </Button>
          <FormSubmitButton variant="primary" data-test="button-submit" isDisabled={isPending}>
            {t(labels.save)}
          </FormSubmitButton>
        </FormButtons>
      </Column>
    </Form>
  );
}
