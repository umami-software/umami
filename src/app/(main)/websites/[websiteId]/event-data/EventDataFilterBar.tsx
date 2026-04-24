'use client';
import { Button, Icon, Row, Text, Tooltip, TooltipTrigger } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { X } from '@/components/icons';
import type { EventPropertyFilter } from '@/lib/types';

export function EventDataFilterBar({
  filters,
  onChange,
}: {
  filters: EventPropertyFilter[];
  onChange: (filters: EventPropertyFilter[]) => void;
}) {
  const { t, labels } = useMessages();

  if (!filters.length) return null;

  const operatorLabel = (op: string) => {
    switch (op) {
      case 'eq': return t(labels.is);
      case 'neq': return t(labels.isNot);
      case 'c': return t(labels.contains);
      case 'dnc': return t(labels.doesNotContain);
      case 'regex': return t(labels.regexMatch);
      case 'notRegex': return t(labels.regexNotMatch);
      case 'gt': return t(labels.greaterThan);
      case 'lt': return t(labels.lessThan);
      case 'gte': return t(labels.greaterThanEquals);
      case 'lte': return t(labels.lessThanEquals);
      default: return op;
    }
  };

  const handleRemove = (index: number) => {
    onChange(filters.filter((_, i) => i !== index));
  };

  return (
    <Row gap alignItems="center" justifyContent="space-between" padding="2" backgroundColor="surface-sunken" wrap="wrap">
      <Row alignItems="center" gap="2" wrap="wrap" width={{ base: '100%', md: 'auto' }}>
        {filters.map((filter, index) => (
          <FilterPill
            key={`${filter.propertyName}-${index}`}
            label={filter.propertyName}
            operator={operatorLabel(filter.operator)}
            value={filter.value}
            onRemove={() => handleRemove(index)}
          />
        ))}
      </Row>
      <TooltipTrigger delay={0}>
        <Button variant="zero" onPress={() => onChange([])}>
          <Icon>
            <X />
          </Icon>
        </Button>
        <Tooltip>
          <Text>{t(labels.clearAll)}</Text>
        </Tooltip>
      </TooltipTrigger>
    </Row>
  );
}

function FilterPill({
  label,
  operator,
  value,
  onRemove,
}: {
  label: string;
  operator: string;
  value: string;
  onRemove: () => void;
}) {
  return (
    <Row border padding="2" color backgroundColor borderRadius alignItems="center" gap="4" theme="dark">
      <Row alignItems="center" gap="2" style={{ maxWidth: 'min(500px, calc(100vw - 10rem))', minWidth: 0, overflow: 'hidden' }}>
        <Text color="primary" weight="bold">
          {label}
        </Text>
        <Text color="muted">{operator}</Text>
        <Text
          color="primary"
          weight="bold"
          style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {value}
        </Text>
      </Row>
      <Icon onClick={onRemove} size="xs" style={{ cursor: 'pointer' }}>
        <X />
      </Icon>
    </Row>
  );
}
