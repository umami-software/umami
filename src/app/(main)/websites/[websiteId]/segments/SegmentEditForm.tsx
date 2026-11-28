import {
  Button,
  DialogFooter,
  Form,
  FormField,
  FormSubmitButton,
  Loading,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TextField,
} from '@umami/react-zen';
import { type CSSProperties, useEffect, useState } from 'react';
import { OverlayScrollArea } from '@/components/common/OverlayScrollArea';
import { useMessages, useUpdateQuery, useWebsiteSegmentQuery } from '@/components/hooks';
import { FieldFilters } from '@/components/input/FieldFilters';
import { PropertyFilters } from '@/components/property-data/PropertyFilters';
import type { SessionPropertyFilter } from '@/lib/types';

// The tab content fills the remaining height and its scroll area takes all of it.
const tabContentStyle: CSSProperties = {
  display: 'grid',
  gridTemplateRows: 'minmax(0, 1fr)',
  minHeight: 0,
  margin: -4,
};

// The padding keeps focus rings from being clipped by the scroll area.
const scrollBodyStyle: CSSProperties = { padding: 4 };

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
      // Fills the dialog so only the fields scroll, keeping the footer in view.
      style={{ flexGrow: 1, minHeight: 0 }}
    >
      <FormField name="name" label={t(labels.name)} rules={{ required: t(labels.required) }}>
        <TextField autoFocus={!segmentId} />
      </FormField>
      {showFilters && (
        // Only the open tab's content scrolls, so the tabs and footer stay in view.
        <Tabs defaultValue="filters" style={{ flexGrow: 1, minHeight: 0 }}>
          <TabsList>
            <TabsTrigger value="filters">{t(labels.filters)}</TabsTrigger>
            <TabsTrigger value="sessionData">{t(labels.sessionData)}</TabsTrigger>
          </TabsList>
          <TabsContent value="filters" style={tabContentStyle}>
            <OverlayScrollArea>
              <div style={scrollBodyStyle}>
                <FormField name="parameters.filters">
                  {({ field }) => (
                    <FieldFilters
                      websiteId={websiteId}
                      value={field.value}
                      onChange={field.onChange}
                      match={currentMatch}
                      onMatchChange={setCurrentMatch}
                    />
                  )}
                </FormField>
              </div>
            </OverlayScrollArea>
          </TabsContent>
          <TabsContent value="sessionData" style={tabContentStyle}>
            <OverlayScrollArea>
              <div style={scrollBodyStyle}>
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
              </div>
            </OverlayScrollArea>
          </TabsContent>
        </Tabs>
      )}
      <DialogFooter>
        <Button variant="outline" disabled={isPending} onClick={onClose}>
          {t(labels.cancel)}
        </Button>
        <FormSubmitButton data-test="button-submit" disabled={isPending}>
          {t(labels.save)}
        </FormSubmitButton>
      </DialogFooter>
    </Form>
  );
}
