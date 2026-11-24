'use client';
import { Button, Icon, Row, Text, Tooltip, TooltipContent, TooltipTrigger } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { X } from '@/components/icons';
import { OPERATORS } from '@/lib/constants';
import type { PropertyFilter } from '@/lib/types';

export function PropertyFilterBar({
  filters,
  onChange,
}: {
  filters: PropertyFilter[];
  onChange: (filters: PropertyFilter[]) => void;
}) {
  const { t, labels } = useMessages();

  if (!filters.length) return null;

  const operatorLabel = (op: string) => {
    switch (op) {
      case OPERATORS.equals:
        return t(labels.is);
      case OPERATORS.notEquals:
        return t(labels.isNot);
      case OPERATORS.contains:
        return t(labels.contains);
      case OPERATORS.doesNotContain:
        return t(labels.doesNotContain);
      case OPERATORS.regex:
        return t(labels.regexMatch);
      case OPERATORS.notRegex:
        return t(labels.regexNotMatch);
      case OPERATORS.greaterThan:
        return t(labels.greaterThan);
      case OPERATORS.lessThan:
        return t(labels.lessThan);
      case OPERATORS.greaterThanEquals:
        return t(labels.greaterThanEquals);
      case OPERATORS.lessThanEquals:
        return t(labels.lessThanEquals);
      case OPERATORS.before:
        return t(labels.before);
      case OPERATORS.after:
        return t(labels.after);
      default:
        return op;
    }
  };

  return (
    <Row
      gap
      alignItems="center"
      justifyContent="space-between"
      padding="2"
      border
      borderRadius
      wrap="wrap"
    >
      <Row alignItems="center" gap="2" wrap="wrap" width={{ base: '100%', md: 'auto' }}>
        {filters.map((filter, index) => (
          <FilterPill
            key={`${filter.propertyName}-${index}`}
            label={filter.propertyName}
            operator={operatorLabel(filter.operator)}
            value={filter.value}
            onRemove={() => onChange(filters.filter((_, i) => i !== index))}
          />
        ))}
      </Row>
      <Tooltip>
        <TooltipTrigger
          delay={0}
          render={
            <Button variant="ghost" className="hover:bg-transparent" onClick={() => onChange([])} />
          }
        >
          <Icon>
            <X />
          </Icon>
        </TooltipTrigger>
        <TooltipContent>
          <Text>{t(labels.clearAll)}</Text>
        </TooltipContent>
      </Tooltip>
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
    <Row
      border
      padding="2"
      color
      backgroundColor
      borderRadius
      alignItems="center"
      gap="4"
      theme="dark"
    >
      <Row
        alignItems="center"
        gap="2"
        style={{ maxWidth: 'min(500px, calc(100vw - 10rem))', minWidth: 0, overflow: 'hidden' }}
      >
        <Text color="foreground" weight="bold">
          {label}
        </Text>
        <Text color="muted-foreground">{operator}</Text>
        <Text
          color="foreground"
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
