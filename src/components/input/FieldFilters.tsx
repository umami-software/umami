import {
  Button,
  Column,
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Field,
  FieldLabel,
  Grid,
  Icon,
  List,
  ListItem,
  ListSection,
  Row,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@umami/react-zen';
import { endOfDay, subMonths } from 'date-fns';
import type { Key } from 'react';
import { Empty } from '@/components/common/Empty';
import { FilterRecord } from '@/components/common/FilterRecord';
import { OverlayScrollArea } from '@/components/common/OverlayScrollArea';
import { ScrollableDropdownMenuContent } from '@/components/common/ScrollableDropdownMenuContent';
import { type FieldGroup, useFields, useMessages, useMobile } from '@/components/hooks';
import { Plus } from '@/components/icons';

export interface FieldFiltersProps {
  websiteId?: string;
  value?: { name: string; operator: string; value: string }[];
  exclude?: string[];
  match?: string;
  onChange?: (data: any) => void;
  onMatchChange?: (match: string) => void;
}

export function FieldFilters({
  websiteId,
  value: valueProp,
  exclude = [],
  match = 'all',
  onChange,
  onMatchChange,
}: FieldFiltersProps) {
  // Segments saved through the API, or by older versions, may have no filters.
  const value = valueProp ?? [];
  const { t, labels, messages } = useMessages();
  const { fields, groupLabels } = useFields();
  const startDate = subMonths(endOfDay(new Date()), 6);
  const endDate = endOfDay(new Date());
  const { isMobile } = useMobile();
  const matchItems = [
    { value: 'all', label: t(labels.matchAll) },
    { value: 'any', label: t(labels.matchAny) },
  ];

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

  const updateFilter = (index: number, props: Record<string, any>) => {
    onChange(value.map((filter, i) => (i === index ? { ...filter, ...props } : filter)));
  };

  const handleAdd = (name: Key) => {
    onChange(value.concat({ name: name.toString(), operator: 'eq', value: '' }));
  };

  const handleChange = (index: number, val: Key) => {
    updateFilter(index, { value: val });
  };

  const handleSelect = (index: number, operator: Key) => {
    updateFilter(index, { operator });
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <Grid columns={{ base: '1fr', md: '180px 1fr' }} overflow="hidden" gapY="6">
      <Row display={{ base: 'flex', md: 'none' }} alignItems="flex-start">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
            <Icon>
              <Plus />
            </Icon>
          </DropdownMenuTrigger>
          <ScrollableDropdownMenuContent
            side={isMobile ? 'left' : 'bottom'}
            align={isMobile ? undefined : 'start'}
            style={{ maxHeight: 'calc(100vh - 2rem)' }}
          >
            {groupLabels.map(({ key: groupKey, label }) => {
              const groupFields = groupedFields[groupKey];
              if (!groupFields || groupFields.length === 0) return null;
              return (
                <DropdownMenuGroup key={groupKey}>
                  <DropdownMenuLabel>{label}</DropdownMenuLabel>
                  {groupFields.map(field => {
                    return (
                      <DropdownMenuItem key={field.name} onClick={() => handleAdd(field.name)}>
                        {field.filterLabel}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuGroup>
              );
            })}
          </ScrollableDropdownMenuContent>
        </DropdownMenu>
      </Row>
      <Column
        display={{ base: 'none', md: 'flex' }}
        border="right"
        paddingRight="3"
        marginRight="6"
      >
        <List>
          {groupLabels.map(({ key: groupKey, label }) => {
            const groupFields = groupedFields[groupKey];
            if (!groupFields || groupFields.length === 0) return null;

            return (
              <ListSection key={groupKey} title={label}>
                {groupFields.map(field => {
                  return (
                    <ListItem
                      key={field.name}
                      value={field.name}
                      onClick={() => handleAdd(field.name)}
                    >
                      {field.filterLabel}
                    </ListItem>
                  );
                })}
              </ListSection>
            );
          })}
        </List>
      </Column>
      <OverlayScrollArea style={{ contain: 'layout' }}>
        <Column gapY="4">
          {onMatchChange && (
            <Row alignItems="center" gap>
              <Field>
                <FieldLabel>{t(labels.match)}</FieldLabel>
                <Select
                  items={matchItems}
                  value={match}
                  onValueChange={value => onMatchChange(value as string)}
                >
                  <SelectTrigger style={{ width: 150 }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    <SelectGroup>
                      {matchItems.map(item => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </Row>
          )}
          {value.map((filter, index) => {
            return (
              <FilterRecord
                key={`${filter.name}-${index}`}
                websiteId={websiteId}
                type={filter.name}
                startDate={startDate}
                endDate={endDate}
                {...filter}
                onSelect={(_name, operator) => handleSelect(index, operator)}
                onRemove={() => handleRemove(index)}
                onChange={(_name, val) => handleChange(index, val)}
              />
            );
          })}
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
      </OverlayScrollArea>
    </Grid>
  );
}
