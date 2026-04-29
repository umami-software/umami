'use client';
import { Button, Column, Grid, Icon, List, ListItem, Menu, MenuItem, MenuTrigger, Popover, Row } from '@umami/react-zen';
import { format } from 'date-fns';
import { useState } from 'react';
import { Empty } from '@/components/common/Empty';
import { useMessages, useMobile, usePropertyFieldsQuery } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { DATA_TYPE, OPERATORS } from '@/lib/constants';
import type { PropertyFilter } from '@/lib/types';
import type { PropertyDataSource } from '@/components/hooks/queries/usePropertyFieldsQuery';
import { PropertyFilterRecord } from './PropertyFilterRecord';

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
  const { t, labels, messages } = useMessages();
  const { isMobile } = useMobile();
  const [filters, setFilters] = useState<PropertyFilter[]>(value);
  const { data: queriedFields = [] } = usePropertyFieldsQuery(source, websiteId, eventName, {
    enabled: !providedFields,
  });
  const fields = providedFields ?? queriedFields;

  const handleAdd = (propertyName: string) => {
    const field = (fields as any[]).find(f => f.propertyName === propertyName);
    const dataType: number = field?.dataType ?? DATA_TYPE.string;
    setFilters(prev => [
      ...prev,
      {
        propertyName,
        dataType,
        operator:
          dataType === DATA_TYPE.date
            ? OPERATORS.before
            : dataType === DATA_TYPE.array
              ? OPERATORS.contains
              : OPERATORS.equals,
        value:
          dataType === DATA_TYPE.boolean
            ? 'true'
            : dataType === DATA_TYPE.date
              ? format(new Date(), 'yyyy-MM-dd')
              : '',
      },
    ]);
  };

  return (
    <Column width={isMobile ? 'auto' : '700px'} gap="6">
      <Column minHeight="400px">
        <Grid columns={{ base: '1fr', md: '180px 1fr' }} overflow="hidden" gapY="6">
          <Row display={{ base: 'flex', md: 'none' }}>
            <MenuTrigger>
              <Button>
                <Icon>
                  <Plus />
                </Icon>
              </Button>
              <Popover placement="bottom start" shouldFlip>
                <Menu
                  onAction={key => handleAdd(key.toString())}
                  style={{ maxHeight: 'calc(100vh - 2rem)', overflowY: 'auto' }}
                >
                  {(fields as any[]).map(field => (
                    <MenuItem key={`${field.propertyName}:${field.dataType}`} id={field.propertyName}>
                      {field.propertyName}
                    </MenuItem>
                  ))}
                </Menu>
              </Popover>
            </MenuTrigger>
          </Row>
          <Column
            display={{ base: 'none', md: 'flex' }}
            border="right"
            paddingRight="3"
            marginRight="6"
          >
            <List onAction={key => handleAdd(key.toString())}>
              {(fields as any[]).map(field => (
                <ListItem key={`${field.propertyName}:${field.dataType}`} id={field.propertyName}>
                  {field.propertyName}
                </ListItem>
              ))}
            </List>
          </Column>
          <Column overflow="auto" gapY="4" style={{ contain: 'layout' }}>
            {filters.map((filter, index) => (
              <PropertyFilterRecord
                key={`${filter.propertyName}-${index}`}
                source={source}
                websiteId={websiteId}
                eventName={eventName}
                filter={filter}
                filters={filters}
                onChange={f => setFilters(prev => prev.map((item, i) => (i === index ? f : item)))}
                onRemove={() => setFilters(prev => prev.filter((_, i) => i !== index))}
              />
            ))}
            {!filters.length && <Empty message={t(messages.nothingSelected)} />}
          </Column>
        </Grid>
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
