'use client';
import { useMessages } from '@/components/hooks';
import { ListFilter } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import type { EventPropertyFilter } from '@/lib/types';
import { EventDataFilterEditForm } from './EventDataFilterEditForm';

export function EventDataFilterButton({
  websiteId,
  eventName,
  eventFilters,
  onApply,
}: {
  websiteId: string;
  eventName: string;
  eventFilters: EventPropertyFilter[];
  onApply: (filters: EventPropertyFilter[]) => void;
}) {
  const { t, labels } = useMessages();

  return (
    <DialogButton icon={<ListFilter />} label={t(labels.propertyFilter)} variant="outline">
      {({ close }) => (
        <EventDataFilterEditForm
          websiteId={websiteId}
          eventName={eventName}
          value={eventFilters}
          onApply={onApply}
          onClose={close}
        />
      )}
    </DialogButton>
  );
}
