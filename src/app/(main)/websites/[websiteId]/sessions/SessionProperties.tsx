import { Column, ComboBox, Grid, Label, ListItem, Row } from '@umami/react-zen';
import { useMemo, useState } from 'react';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useMessages, usePropertyFieldsQuery, useSessionDataPropertiesQuery } from '@/components/hooks';
import { DATA_TYPE } from '@/lib/constants';
import type { PropertyFilter } from '@/lib/types';
import { PropertyChart } from '@/components/property-data/PropertyChart';
import { PropertyDateChart } from '@/components/property-data/PropertyDateChart';
import { PropertyFilterBar } from '@/components/property-data/PropertyFilterBar';
import { PropertyFilterButton } from '@/components/property-data/PropertyFilterButton';
import { PropertyNumericChart } from '@/components/property-data/PropertyNumericChart';
import { Panel } from '@/components/common/Panel';
import { SessionDataPivotTable } from '../session-data/SessionDataPivotTable';
import { SessionPropertyChart } from '../session-data/SessionPropertyChart';

export function SessionProperties({ websiteId }: { websiteId: string }) {
  const [propertyName, setPropertyName] = useState('');
  const [propertyFilters, setPropertyFilters] = useState<PropertyFilter[]>([]);
  const { t, labels } = useMessages();
  const { data, isLoading, isFetching, error } = usePropertyFieldsQuery('session', websiteId);
  const { data: scopedData } = useSessionDataPropertiesQuery(
    websiteId,
    propertyName ? { selectedPropertyName: propertyName, propertyFilters } : undefined,
    { enabled: !!propertyName },
  );

  const properties = useMemo(() => {
    if (!data) return [];
    const seen = new Set<string>();

    return data.filter((field: { propertyName: string; dataType: number }) => {
      if (seen.has(field.propertyName)) return false;
      seen.add(field.propertyName);
      return true;
    });
  }, [data]);

  const selectedProperty = useMemo(
    () => properties.find((field: { propertyName: string }) => field.propertyName === propertyName),
    [properties, propertyName],
  );
  const scopedProperties = useMemo(() => {
    if (!scopedData) return [];
    const seen = new Set<string>();

    return scopedData.filter((field: { propertyName: string }) => {
      if (seen.has(field.propertyName)) return false;
      seen.add(field.propertyName);
      return true;
    });
  }, [scopedData]);
  const scopedPropertyKeys = useMemo(
    () => scopedProperties.map((field: { propertyName: string }) => field.propertyName),
    [scopedProperties],
  );

  return (
    <LoadingPanel
      isLoading={isLoading}
      isFetching={isFetching}
      data={data}
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
                <Label>{t(labels.property)}</Label>
                <ComboBox
                  inputValue={propertyName}
                  onInputChange={setPropertyName}
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
            {propertyName && (
              <Row
                width={{ base: '100%', md: 'auto' }}
                marginTop={{ base: '2', md: '0' }}
                style={{ minWidth: 0 }}
              >
                <PropertyFilterButton
                  source="session"
                  websiteId={websiteId}
                  fields={scopedProperties}
                  filters={propertyFilters}
                  onApply={setPropertyFilters}
                />
              </Row>
            )}
          </Grid>
        )}
        {propertyName && <PropertyFilterBar filters={propertyFilters} onChange={setPropertyFilters} />}
        {propertyName && selectedProperty?.dataType === DATA_TYPE.number && (
          <PropertyNumericChart
            source="session"
            websiteId={websiteId}
            propertyName={propertyName}
            propertyFilters={propertyFilters}
          />
        )}
        {propertyName && selectedProperty?.dataType === DATA_TYPE.date && (
          <PropertyDateChart
            source="session"
            websiteId={websiteId}
            propertyName={propertyName}
            propertyFilters={propertyFilters}
          />
        )}
        {propertyName && selectedProperty?.dataType === DATA_TYPE.string && (
          <SessionPropertyChart
            websiteId={websiteId}
            propertyName={propertyName}
            propertyFilters={propertyFilters}
          />
        )}
        {propertyName && selectedProperty?.dataType === DATA_TYPE.boolean && (
          <PropertyChart
            source="session"
            websiteId={websiteId}
            propertyName={propertyName}
            propertyFilters={propertyFilters}
          />
        )}
        {propertyName && selectedProperty?.dataType === DATA_TYPE.array && (
          <PropertyChart
            source="session"
            websiteId={websiteId}
            propertyName={propertyName}
            propertyFilters={propertyFilters}
            seriesType="array"
          />
        )}
        {propertyName && (
          <Panel minWidth="0" width="100%">
            <SessionDataPivotTable
              websiteId={websiteId}
              propertyName={propertyName}
              propertyKeys={scopedPropertyKeys}
              propertyFilters={propertyFilters}
            />
          </Panel>
        )}
      </Column>
    </LoadingPanel>
  );
}
