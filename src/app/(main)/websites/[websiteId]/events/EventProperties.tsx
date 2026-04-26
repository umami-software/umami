'use client';
import { Column, ComboBox, Grid, Label, ListItem, Row, Select } from '@umami/react-zen';
import { useMemo, useState } from 'react';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useEventDataPropertiesQuery, useMessages } from '@/components/hooks';
import { DATA_TYPE } from '@/lib/constants';
import type { EventPropertyFilter } from '@/lib/types';
import { EventDataDateChart } from '../event-data/EventDataDateChart';
import { EventDataFilterBar } from '../event-data/EventDataFilterBar';
import { EventDataFilterButton } from '../event-data/EventDataFilterButton';
import { EventDataNumericChart } from '../event-data/EventDataNumericChart';
import { EventDataPivotTable } from '../event-data/EventDataPivotTable';
import { EventDataPropertyChart } from '../event-data/EventDataPropertyChart';

export function EventProperties({ websiteId }: { websiteId: string }) {
  const [eventName, setEventName] = useState('');
  const [propertyName, setPropertyName] = useState('');
  const [eventFilters, setEventFilters] = useState<EventPropertyFilter[]>([]);
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
        const key = `${field.propertyName}:${field.dataType}`;

        if (seen.has(key)) return false;
        seen.add(key);

        return true;
      });
  }, [data, eventName]);

  const selectedProperty = useMemo(() => {
    return properties.find(
      (field: { propertyName: string; dataType: number }) => field.propertyName === propertyName,
    );
  }, [properties, propertyName]);

  const handleEventChange = (value: string) => {
    setEventName(value);
    setPropertyName('');
    setEventFilters([]);
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
              <Column gap="1" style={{ minWidth: 0 }}>
                <Label>{t(labels.event)}</Label>
                <Select
                  value={eventName}
                  onChange={handleEventChange}
                  placeholder={t(labels.selectEvent)}
                  maxHeight={480}
                >
                  {eventNames.map(name => (
                    <ListItem key={name} id={name}>
                      {name}
                    </ListItem>
                  ))}
                </Select>
              </Column>
              <Column gap="1" style={{ minWidth: 0 }}>
                <Label>{t(labels.property)}</Label>
                <ComboBox
                  inputValue={propertyName}
                  onInputChange={setPropertyName}
                  isDisabled={!eventName}
                  allowsCustomValue
                  allowsEmptyCollection
                >
                  {properties.map((field: { propertyName: string }) => (
                    <ListItem key={field.propertyName} id={field.propertyName}>
                      {field.propertyName}
                    </ListItem>
                  ))}
                </ComboBox>
              </Column>
            </Grid>
            {eventName && (
              <Row
                width={{ base: '100%', md: 'auto' }}
                marginTop={{ base: '2', md: '0' }}
                style={{ minWidth: 0 }}
              >
                <EventDataFilterButton
                  websiteId={websiteId}
                  eventName={eventName}
                  eventFilters={eventFilters}
                  onApply={setEventFilters}
                />
              </Row>
            )}
          </Grid>
        )}
        {eventName && (
          <EventDataFilterBar filters={eventFilters} onChange={setEventFilters} />
        )}
        {eventName && propertyName && (
          <Column border="bottom" paddingBottom="6">
            {(selectedProperty?.dataType === DATA_TYPE.string ||
              selectedProperty?.dataType === DATA_TYPE.boolean) && (
              <EventDataPropertyChart
                websiteId={websiteId}
                eventName={eventName}
                propertyName={propertyName}
                eventFilters={eventFilters}
              />
            )}
            {selectedProperty?.dataType === DATA_TYPE.number && (
              <EventDataNumericChart
                websiteId={websiteId}
                eventName={eventName}
                propertyName={propertyName}
                eventFilters={eventFilters}
              />
            )}
            {selectedProperty?.dataType === DATA_TYPE.date && (
              <EventDataDateChart
                websiteId={websiteId}
                eventName={eventName}
                propertyName={propertyName}
                eventFilters={eventFilters}
              />
            )}
            {selectedProperty?.dataType === DATA_TYPE.array && (
              <EventDataPropertyChart
                websiteId={websiteId}
                eventName={eventName}
                propertyName={propertyName}
                eventFilters={eventFilters}
                seriesType="array"
              />
            )}
          </Column>
        )}
        {eventName && (
          <EventDataPivotTable
            websiteId={websiteId}
            eventName={eventName}
            eventFilters={eventFilters}
          />
        )}
      </Column>
    </LoadingPanel>
  );
}
