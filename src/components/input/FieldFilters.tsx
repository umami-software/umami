import {
  Button,
  Column,
  Grid,
  Icon,
  List,
  ListItem,
  ListSection,
  Menu,
  MenuItem,
  MenuSection,
  MenuTrigger,
  Popover,
  Row,
} from '@umami/react-zen';
import { endOfDay, subMonths } from 'date-fns';
import type { Key } from 'react';
import { Empty } from '@/components/common/Empty';
import { FilterRecord } from '@/components/common/FilterRecord';
import { type FieldGroup, useFields, useMessages, useMobile } from '@/components/hooks';
import { Plus } from '@/components/icons';

export interface FieldFiltersProps {
  websiteId: string;
  value?: { name: string; operator: string; value: string }[];
  exclude?: string[];
  onChange?: (data: any) => void;
}

export function FieldFilters({ websiteId, value, exclude = [], onChange }: FieldFiltersProps) {
  const { t, messages } = useMessages();
  const { fields, groupLabels } = useFields();
  const startDate = subMonths(endOfDay(new Date()), 6);
  const endDate = endOfDay(new Date());
  const { isMobile } = useMobile();

  const groupedFields = fields
    .filter(({ name }) => !exclude.includes(name))
    .reduce(
      (acc, field) => {
        const group = field.group;
        if (!acc[group]) {
          acc[group] = [];
        }
        acc[group].push(field);
        return acc;
      },
      {} as Record<FieldGroup, typeof fields>,
    );

  const updateFilter = (name: string, props: Record<string, any>) => {
    onChange(value.map(filter => (filter.name === name ? { ...filter, ...props } : filter)));
  };

  const handleAdd = (name: Key) => {
    onChange(value.concat({ name: name.toString(), operator: 'eq', value: '' }));
  };

  const handleChange = (name: string, value: Key) => {
    updateFilter(name, { value });
  };

  const handleSelect = (name: string, operator: Key) => {
    updateFilter(name, { operator });
  };

  const handleRemove = (name: string) => {
    onChange(value.filter(filter => filter.name !== name));
  };

  return (
    <Grid columns={{ base: '1fr', md: '180px 1fr' }} overflow="hidden" gapY="6">
      <Row display={{ base: 'flex', md: 'none' }}>
        <MenuTrigger>
          <Button>
            <Icon>
              <Plus />
            </Icon>
          </Button>
          <Popover placement={isMobile ? 'left' : 'bottom start'} shouldFlip>
            <Menu
              onAction={handleAdd}
              style={{ maxHeight: 'calc(100vh - 2rem)', overflowY: 'auto' }}
            >
              {groupLabels.map(({ key: groupKey, label }) => {
                const groupFields = groupedFields[groupKey];
                return (
                  <MenuSection key={groupKey} title={label}>
                    {groupFields.map(field => {
                      const isDisabled = !!value.find(({ name }) => name === field.name);
                      return (
                        <MenuItem key={field.name} id={field.name} isDisabled={isDisabled}>
                          {field.filterLabel}
                        </MenuItem>
                      );
                    })}
                  </MenuSection>
                );
              })}
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
        <List onAction={handleAdd}>
          {groupLabels.map(({ key: groupKey, label }) => {
            const groupFields = groupedFields[groupKey];
            if (!groupFields || groupFields.length === 0) return null;

            return (
              <ListSection key={groupKey} title={label}>
                {groupFields.map(field => {
                  const isDisabled = !!value.find(({ name }) => name === field.name);
                  return (
                    <ListItem key={field.name} id={field.name} isDisabled={isDisabled}>
                      {field.filterLabel}
                    </ListItem>
                  );
                })}
              </ListSection>
            );
          })}
        </List>
      </Column>
      <Column overflow="auto" gapY="4" style={{ contain: 'layout' }}>
        {value.map(filter => {
          return (
            <FilterRecord
              key={filter.name}
              websiteId={websiteId}
              type={filter.name}
              startDate={startDate}
              endDate={endDate}
              {...filter}
              onSelect={handleSelect}
              onRemove={handleRemove}
              onChange={handleChange}
            />
          );
        })}
        {!value.length && <Empty message={t(messages.nothingSelected)} />}
      </Column>
    </Grid>
  );
}
