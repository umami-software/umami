'use client';
import { Button, Column, DialogFooter } from '@umami/react-zen';
import { useState } from 'react';
import { useMessages, useMobile } from '@/components/hooks';
import type { PropertyDataSource } from '@/components/hooks/queries/usePropertyFieldsQuery';
import type { PropertyFilter } from '@/lib/types';
import { PropertyFilters } from './PropertyFilters';

export function PropertyFilterEditForm({
  source,
  websiteId,
  eventName,
  fields: providedFields,
  value,
  onApply,
  onClose,
}: {
  source: PropertyDataSource;
  websiteId: string;
  eventName?: string;
  fields?: Array<{ propertyName: string; dataType: number }>;
  value: PropertyFilter[];
  onApply: (filters: PropertyFilter[]) => void;
  onClose: () => void;
}) {
  const { t, labels } = useMessages();
  const { isMobile } = useMobile();
  const [filters, setFilters] = useState<PropertyFilter[]>(value);

  return (
    <Column width={isMobile ? 'auto' : '800px'} gap="6">
      <Column minHeight="400px">
        <PropertyFilters
          source={source}
          websiteId={websiteId}
          eventName={eventName}
          fields={providedFields}
          value={filters}
          onChange={setFilters}
        />
      </Column>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => setFilters([])}
          style={isMobile ? undefined : { marginRight: 'auto' }}
        >
          {t(labels.reset)}
        </Button>
        <Button variant="outline" onClick={onClose}>
          {t(labels.cancel)}
        </Button>
        <Button
          onClick={() => {
            onApply(filters);
            onClose();
          }}
        >
          {t(labels.apply)}
        </Button>
      </DialogFooter>
    </Column>
  );
}
