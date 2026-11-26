'use client';
import { Column, Field, FieldLabel, Grid, Row, Text } from '@umami/react-zen';
import { useMemo, useState } from 'react';
import { ComboBox } from '@/components/common/ComboBox';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Panel } from '@/components/common/Panel';
import { SearchSelect } from '@/components/common/SearchSelect';
import { useEventDataPropertiesQuery, useMessages } from '@/components/hooks';
import { PropertyChart } from '@/components/property-data/PropertyChart';
import { PropertyDateChart } from '@/components/property-data/PropertyDateChart';
import { PropertyFilterBar } from '@/components/property-data/PropertyFilterBar';
import { PropertyFilterButton } from '@/components/property-data/PropertyFilterButton';
import { PropertyNumericChart } from '@/components/property-data/PropertyNumericChart';
import { DATA_TYPE } from '@/lib/constants';
import type { PropertyFilter } from '@/lib/types';
import { EventDataPivotTable } from '../event-data/EventDataPivotTable';

const selectValueStyle = {
  display: 'block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap' as const,
};

export function EventProperties({ websiteId }: { websiteId: string }) {
  const [eventName, setEventName] = useState('');
  const [eventSearch, setEventSearch] = useState('');
  const [propertyName, setPropertyName] = useState('');
  const [propertyFilters, setPropertyFilters] = useState<PropertyFilter[]>([]);
  const { t, labels } = useMessages();

  const { data, isLoading, isFetching, error } = useEventDataPropertiesQuery(websiteId);

  const eventNames = useMemo<string[]>(() => {
    if (!data) return [];
    return [...new Set<string>(data.map((e: { eventName: string }) => e.eventName))];
  }, [data]);

  const properties = useMemo(() => {
    if (!data || !eventName) return [];

    const seen = new Set<string>();

    return data
      .filter((field: { eventName: string }) => field.eventName === eventName)
      .filter((field: { propertyName: string; dataType: number }) => {
        if (seen.has(field.propertyName)) return false;
        seen.add(field.propertyName);

        return true;
      });
  }, [data, eventName]);

  const selectedProperty = useMemo(() => {
    return properties.find(
      (field: { propertyName: string; dataType: number }) => field.propertyName === propertyName,
    );
  }, [properties, propertyName]);

  const filteredEventNames = useMemo(() => {
    if (!eventSearch) {
      return eventNames;
    }

    const normalizedSearch = eventSearch.toLowerCase();

    return eventNames.filter(name => name.toLowerCase().includes(normalizedSearch));
  }, [eventNames, eventSearch]);

  const handleEventChange = (value: string) => {
    const nextProperties = new Set<string>(
      data
        ?.filter((field: { eventName: string }) => field.eventName === value)
        .map((field: { propertyName: string }) => field.propertyName) ?? [],
    );

    setEventName(value);
    setPropertyName(nextProperties.has(propertyName) ? propertyName : '');
    setPropertyFilters([]);
  };

  const handleEventOpenChange = () => {
    setEventSearch('');
  };

  return (
    <LoadingPanel
      data={data}
      isLoading={isLoading}
      isFetching={isFetching}
      error={error}
      minHeight="300px"
    >
      <Column gap="6" minWidth="0">
        {data && (
          <Grid
            columns={{ base: '1fr', md: '1fr auto' }}
            gap
            alignItems="end"
            marginBottom="3"
            width="100%"
            style={{ minWidth: 0 }}
          >
            <Grid
              columns={{ base: '1fr', md: 'repeat(auto-fill, minmax(300px, 1fr))' }}
              gap
              width="100%"
              style={{ flex: 1, minWidth: 0 }}
            >
              <Field className="min-w-0">
                <FieldLabel>{t(labels.event)}</FieldLabel>
                <SearchSelect
                  value={eventName || null}
                  items={filteredEventNames.map(name => ({ id: name, name }))}
                  onChange={handleEventChange}
                  onSearch={setEventSearch}
                  onOpenChange={handleEventOpenChange}
                  maxHeight={400}
                  triggerProps={{
                    className: 'w-full justify-between',
                    style: { minWidth: 0, maxWidth: '100%', overflow: 'hidden' },
                  }}
                  renderValue={
                    eventName ? (
                      <span style={selectValueStyle}>{eventName}</span>
                    ) : (
                      <Text color="muted" truncate>
                        {t(labels.selectEvent)}
                      </Text>
                    )
                  }
                />
              </Field>
              <ComboBox
                label={t(labels.property)}
                className="min-w-0"
                items={properties.map((field: { propertyName: string }) => field.propertyName)}
                inputValue={propertyName}
                onInputValueChange={setPropertyName}
                disabled={!eventName}
              />
            </Grid>
            {eventName && (
              <Row
                width={{ base: '100%', md: 'auto' }}
                marginTop={{ base: '2', md: '0' }}
                style={{ minWidth: 0 }}
              >
                <PropertyFilterButton
                  source="event"
                  websiteId={websiteId}
                  eventName={eventName}
                  filters={propertyFilters}
                  onApply={setPropertyFilters}
                />
              </Row>
            )}
          </Grid>
        )}
        {eventName && <PropertyFilterBar filters={propertyFilters} onChange={setPropertyFilters} />}
        {eventName && propertyName && (
          <Column key={`${eventName}:${propertyName}`} border="bottom" paddingBottom="6">
            {(selectedProperty?.dataType === DATA_TYPE.string ||
              selectedProperty?.dataType === DATA_TYPE.boolean) && (
              <PropertyChart
                source="event"
                websiteId={websiteId}
                eventName={eventName}
                propertyName={propertyName}
                propertyFilters={propertyFilters}
              />
            )}
            {selectedProperty?.dataType === DATA_TYPE.number && (
              <PropertyNumericChart
                source="event"
                websiteId={websiteId}
                eventName={eventName}
                propertyName={propertyName}
                propertyFilters={propertyFilters}
              />
            )}
            {selectedProperty?.dataType === DATA_TYPE.date && (
              <PropertyDateChart
                source="event"
                websiteId={websiteId}
                eventName={eventName}
                propertyName={propertyName}
                propertyFilters={propertyFilters}
              />
            )}
            {selectedProperty?.dataType === DATA_TYPE.array && (
              <PropertyChart
                source="event"
                websiteId={websiteId}
                eventName={eventName}
                propertyName={propertyName}
                propertyFilters={propertyFilters}
                seriesType="array"
              />
            )}
          </Column>
        )}
        {eventName && (
          <Panel minWidth="0" width="100%">
            <EventDataPivotTable
              websiteId={websiteId}
              eventName={eventName}
              eventFilters={propertyFilters}
            />
          </Panel>
        )}
      </Column>
    </LoadingPanel>
  );
}
