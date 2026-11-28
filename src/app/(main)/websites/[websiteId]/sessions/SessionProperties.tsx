'use client';
import {
  Column,
  DataColumn,
  DataTable,
  Grid,
  Row,
  SearchField,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from '@umami/react-zen';
import { useCallback, useMemo, useState } from 'react';
import { ComboBox } from '@/components/common/ComboBox';
import { Empty } from '@/components/common/Empty';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import {
  useFilters,
  useMessages,
  useNavigation,
  useSessionDataPropertiesQuery,
  useShare,
} from '@/components/hooks';
import { DATA_TYPE, DATA_TYPES, OPERATORS } from '@/lib/constants';
import { formatLongNumber } from '@/lib/format';
import { serializeSessionPropertyFilters } from '@/lib/params';
import { allowShareFilter } from '@/lib/share';
import { SessionPropertyBreakdown } from '../session-data/SessionPropertyBreakdown';
import { SessionPropertyValues } from '../session-data/SessionPropertyValues';

interface SessionPropertyField {
  propertyName: string;
  dataType: number;
  total: number;
}

export function SessionProperties({ websiteId }: { websiteId: string }) {
  const [propertyName, setPropertyName] = useState('');
  const [tab, setTab] = useState<'values' | 'breakdown'>('values');
  const [search, setSearch] = useState('');
  const { t, labels } = useMessages();
  const { router, updateParams, query } = useNavigation();
  const { sessionPropertyFilters } = useFilters();
  const share = useShare();
  const canFilter = allowShareFilter(share?.parameters);

  const { data, isLoading, isFetching, error } = useSessionDataPropertiesQuery(websiteId);

  const properties = useMemo<SessionPropertyField[]>(() => {
    if (!data) return [];
    const seen = new Set<string>();

    return data
      .filter((field: SessionPropertyField) => {
        if (seen.has(field.propertyName)) return false;
        seen.add(field.propertyName);
        return true;
      })
      .map((field: SessionPropertyField) => ({
        propertyName: field.propertyName,
        dataType: field.dataType,
        total: Number(field.total ?? 0),
      }));
  }, [data]);

  const selectedProperty = useMemo(
    () => properties.find(field => field.propertyName === propertyName),
    [properties, propertyName],
  );

  const filteredProperties = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return properties;
    return properties.filter(field => field.propertyName.toLowerCase().includes(term));
  }, [properties, search]);

  const handleSelectValue = useCallback(
    (value: string) => {
      if (!canFilter || !selectedProperty || selectedProperty.dataType === DATA_TYPE.date) {
        return;
      }

      const operator =
        selectedProperty.dataType === DATA_TYPE.array ? OPERATORS.contains : OPERATORS.equals;

      const exists = sessionPropertyFilters.some(
        filter =>
          filter.propertyName === selectedProperty.propertyName &&
          filter.operator === operator &&
          filter.value === value,
      );

      if (exists) {
        return;
      }

      const clearedSessionPropertyFilters = Object.fromEntries(
        Object.keys(query)
          .filter(key => /^spf\d+$/.test(key))
          .map(key => [key, undefined]),
      );

      const nextFilters = [
        ...sessionPropertyFilters,
        {
          propertyName: selectedProperty.propertyName,
          dataType: selectedProperty.dataType,
          operator,
          value,
        },
      ];

      router.push(
        updateParams({
          ...clearedSessionPropertyFilters,
          ...serializeSessionPropertyFilters(nextFilters),
        }),
      );
    },
    [canFilter, selectedProperty, sessionPropertyFilters, query, router, updateParams],
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
            columns={{ base: '1fr', md: 'repeat(auto-fill, minmax(300px, 1fr))' }}
            gap
            width="100%"
            style={{ minWidth: 0 }}
          >
            <ComboBox
              label={t(labels.property)}
              className="min-w-0"
              items={properties.map(field => field.propertyName)}
              inputValue={propertyName}
              onInputValueChange={setPropertyName}
              showClear
            />
          </Grid>
        )}
        {!selectedProperty ? (
          properties.length === 0 ? (
            <Empty />
          ) : (
            <Column gap="4" minWidth="0">
              {properties.length > 10 && (
                <div style={{ width: '100%', maxWidth: 280 }}>
                  <SearchField
                    value={search}
                    onSearch={setSearch}
                    delay={0}
                    placeholder={t(labels.search)}
                    className="w-full"
                  />
                </div>
              )}
              <DataTable
                data={filteredProperties.map(field => ({ ...field, id: field.propertyName }))}
                pageSize={20}
              >
                <DataColumn id="propertyName" label={t(labels.property)} width="minmax(180px, 2fr)">
                  {(row: SessionPropertyField) => (
                    <Row overflow="hidden" minWidth="0">
                      <button
                        type="button"
                        onClick={() => setPropertyName(row.propertyName)}
                        title={row.propertyName}
                        className="truncate text-left font-medium hover:underline cursor-pointer"
                      >
                        {row.propertyName}
                      </button>
                    </Row>
                  )}
                </DataColumn>
                <DataColumn id="dataType" label={t(labels.type)} width="120px">
                  {(row: SessionPropertyField) => (
                    <Text color="muted">{DATA_TYPES[row.dataType] ?? ''}</Text>
                  )}
                </DataColumn>
                <DataColumn id="total" label={t(labels.visitors)} align="end" width="120px">
                  {(row: SessionPropertyField) => formatLongNumber(row.total)}
                </DataColumn>
              </DataTable>
            </Column>
          )
        ) : (
          <Tabs
            value={tab}
            onValueChange={value => setTab(String(value) as 'values' | 'breakdown')}
            style={{ minWidth: 0, width: '100%' }}
          >
            <TabsList>
              <TabsTrigger value="values">{t(labels.values)}</TabsTrigger>
              <TabsTrigger value="breakdown">{t(labels.breakdown)}</TabsTrigger>
            </TabsList>
            <TabsContent value="values" style={{ minWidth: 0, width: '100%' }}>
              <SessionPropertyValues
                key={selectedProperty.propertyName}
                websiteId={websiteId}
                propertyName={selectedProperty.propertyName}
                dataType={selectedProperty.dataType}
                onSelectValue={canFilter ? handleSelectValue : undefined}
              />
            </TabsContent>
            <TabsContent value="breakdown" style={{ minWidth: 0, width: '100%' }}>
              <SessionPropertyBreakdown
                key={selectedProperty.propertyName}
                websiteId={websiteId}
                propertyName={selectedProperty.propertyName}
                dataType={selectedProperty.dataType}
                onSelectValue={canFilter ? handleSelectValue : undefined}
              />
            </TabsContent>
          </Tabs>
        )}
      </Column>
    </LoadingPanel>
  );
}
