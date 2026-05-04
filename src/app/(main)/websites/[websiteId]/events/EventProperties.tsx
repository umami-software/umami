'use client';
import { Column, ComboBox, Grid, Label, ListItem, Row, Select } from '@umami/react-zen';
import { useMemo, useState } from 'react';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Panel } from '@/components/common/Panel';
import { useEventDataPropertiesQuery, useMessages } from '@/components/hooks';
import { DATA_TYPE } from '@/lib/constants';
import type { PropertyFilter } from '@/lib/types';
import { PropertyChart } from '@/components/property-data/PropertyChart';
import { PropertyDateChart } from '@/components/property-data/PropertyDateChart';
import { PropertyFilterBar } from '@/components/property-data/PropertyFilterBar';
import { PropertyFilterButton } from '@/components/property-data/PropertyFilterButton';
import { PropertyNumericChart } from '@/components/property-data/PropertyNumericChart';
import { EventDataPivotTable } from '../event-data/EventDataPivotTable';

export function EventProperties({ websiteId }: { websiteId: string }) {
  const [eventName, setEventName] = useState('');
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

  const handleEventChange = (value: string) => {
    setEventName(value);
    setPropertyName('');
    setPropertyFilters([]);
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
        {eventName && (
          <PropertyFilterBar filters={propertyFilters} onChange={setPropertyFilters} />
        )}
        {eventName && propertyName && (
          <Column border="bottom" paddingBottom="6">
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
