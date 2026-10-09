'use client';
import { Button, Column, Row } from '@umami/react-zen';
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
      <Row alignItems="center" justifyContent="space-between" gap>
        <Button onPress={() => setFilters([])}>{t(labels.reset)}</Button>
        <Row gap>
          <Button onPress={onClose}>{t(labels.cancel)}</Button>
          <Button
            variant="primary"
            onPress={() => {
              onApply(filters);
              onClose();
            }}
          >
            {t(labels.apply)}
          </Button>
        </Row>
      </Row>
    </Column>
  );
}
