'use client';
import {
  Button,
  Column,
  Grid,
  Icon,
  List,
  ListItem,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
  Row,
} from '@umami/react-zen';
import { format } from 'date-fns';
import { Empty } from '@/components/common/Empty';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useMessages, useMobile, usePropertyFieldsQuery } from '@/components/hooks';
import type { PropertyDataSource } from '@/components/hooks/queries/usePropertyFieldsQuery';
import { Plus } from '@/components/icons';
import { DATA_TYPE, OPERATORS } from '@/lib/constants';
import type { PropertyFilter } from '@/lib/types';
import { PropertyFilterRecord } from './PropertyFilterRecord';

export function PropertyFilters({
  source,
  websiteId,
  eventName,
  fields: providedFields,
  value,
  onChange,
}: {
  source: PropertyDataSource;
  websiteId: string;
  eventName?: string;
  fields?: Array<{ propertyName: string; dataType: number }>;
  value: PropertyFilter[];
  onChange: (filters: PropertyFilter[]) => void;
}) {
  const { t, messages } = useMessages();
  const { isMobile } = useMobile();
  const {
    data: queriedFields,
    isLoading,
    isFetching,
  } = usePropertyFieldsQuery(source, websiteId, eventName, {
    enabled: !providedFields,
  });
  const fields = providedFields ?? queriedFields ?? [];

  const handleAdd = (propertyName: string) => {
    const field = (fields as any[]).find(f => f.propertyName === propertyName);
    const dataType: number = field?.dataType ?? DATA_TYPE.string;

    onChange([
      ...value,
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
    <LoadingPanel
      data={fields}
      isLoading={!providedFields && isLoading}
      isFetching={!providedFields && isFetching}
      isEmpty={!fields.length}
      height={isMobile ? undefined : '100%'}
      minHeight={isMobile ? '120px' : undefined}
      loadingPlacement={isMobile ? 'center' : 'absolute'}
    >
      <Grid
        columns={{ base: '1fr', md: '180px 1fr' }}
        overflow="hidden"
        gapY="6"
        style={{ minHeight: isMobile ? undefined : '100%', alignContent: 'start' }}
      >
        <Row display={{ base: 'flex', md: 'none' }} alignItems="flex-start">
          <MenuTrigger>
            <Button size="sm">
              <Icon>
                <Plus />
              </Icon>
            </Button>
            <Popover side="bottom" align="start">
              <Menu style={{ maxHeight: 'calc(100vh - 2rem)', overflowY: 'auto' }}>
                {(fields as any[]).map(field => (
                  <MenuItem
                    key={`${field.propertyName}:${field.dataType}`}
                    id={field.propertyName}
                    onAction={key => handleAdd(key.toString())}
                  >
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
          alignSelf="stretch"
        >
          <List>
            {(fields as any[]).map(field => (
              <ListItem
                key={`${field.propertyName}:${field.dataType}`}
                id={field.propertyName}
                onClick={() => handleAdd(field.propertyName)}
              >
                {field.propertyName}
              </ListItem>
            ))}
          </List>
        </Column>
        <Column overflow="auto" gapY="4" style={{ contain: 'layout' }}>
          {value.map((filter, index) => (
            <PropertyFilterRecord
              key={`${filter.propertyName}-${index}`}
              source={source}
              websiteId={websiteId}
              eventName={eventName}
              filter={filter}
              filters={value}
              onChange={nextFilter =>
                onChange(value.map((item, i) => (i === index ? nextFilter : item)))
              }
              onRemove={() => onChange(value.filter((_, i) => i !== index))}
            />
          ))}
          {!value.length &&
            (isMobile ? (
              <Row
                color="muted"
                justifyContent="center"
                width="100%"
                minHeight="70px"
                style={{ paddingTop: '24px' }}
              >
                {t(messages.nothingSelected)}
              </Row>
            ) : (
              <Empty message={t(messages.nothingSelected)} />
            ))}
        </Column>
      </Grid>
    </LoadingPanel>
  );
}
