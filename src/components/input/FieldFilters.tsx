import { Key } from 'react';
import { subMonths, endOfDay } from 'date-fns';
import {
  Grid,
  Column,
  List,
  ListItem,
  Row,
  Button,
  Popover,
  MenuTrigger,
  Menu,
  MenuItem,
  Icon,
} from '@umami/react-zen';
import { useFields, useMessages, useMobile } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { FilterRecord } from '@/components/common/FilterRecord';
import { Empty } from '@/components/common/Empty';

export interface FieldFiltersProps {
  websiteId: string;
  value?: { name: string; operator: string; value: string }[];
  exclude?: string[];
  onChange?: (data: any) => void;
}

export function FieldFilters({ websiteId, value, exclude = [], onChange }: FieldFiltersProps) {
  const { formatMessage, messages } = useMessages();
  const { fields } = useFields();
  const startDate = subMonths(endOfDay(new Date()), 6);
  const endDate = endOfDay(new Date());
  const { isMobile } = useMobile();

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
    <Grid columns={{ xs: '1fr', md: '180px 1fr' }} overflow="hidden" gapY="6">
      <Row display={{ xs: 'flex', md: 'none' }}>
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
              {fields
                .filter(({ name }) => !exclude.includes(name))
                .map(field => {
                  const isDisabled = !!value.find(({ name }) => name === field.name);
                  return (
                    <MenuItem key={field.name} id={field.name} isDisabled={isDisabled}>
                      {field.label}
                    </MenuItem>
                  );
                })}
            </Menu>
          </Popover>
        </MenuTrigger>
      </Row>
      <Column display={{ xs: 'none', md: 'flex' }} border="right" paddingRight="3" marginRight="6">
        <List onAction={handleAdd}>
          {fields
            .filter(({ name }) => !exclude.includes(name))
            .map(field => {
              const isDisabled = !!value.find(({ name }) => name === field.name);
              return (
                <ListItem key={field.name} id={field.name} isDisabled={isDisabled}>
                  {field.label}
                </ListItem>
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
        {!value.length && <Empty message={formatMessage(messages.nothingSelected)} />}
      </Column>
    </Grid>
  );
}
