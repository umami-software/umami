'use client';
import { useMessages } from '@/components/hooks';
import { ListFilter } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import type { PropertyFilter } from '@/lib/types';
import type { PropertyDataSource } from '@/components/hooks/queries/usePropertyFieldsQuery';
import { PropertyFilterEditForm } from './PropertyFilterEditForm';

export function PropertyFilterButton({
  source,
  websiteId,
  eventName,
  fields,
  filters,
  onApply,
}: {
  source: PropertyDataSource;
  websiteId: string;
  eventName?: string;
  fields?: Array<{ propertyName: string; dataType: number }>;
  filters: PropertyFilter[];
  onApply: (filters: PropertyFilter[]) => void;
}) {
  const { t, labels } = useMessages();

  return (
    <DialogButton icon={<ListFilter />} label={t(labels.propertyFilter)} variant="outline">
      {({ close }) => (
        <PropertyFilterEditForm
          source={source}
          websiteId={websiteId}
          eventName={eventName}
          fields={fields}
          value={filters}
          onApply={onApply}
          onClose={close}
        />
      )}
    </DialogButton>
  );
}
