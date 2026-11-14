import { Button, Column, Icon, Row, Text, Tooltip, TooltipTrigger } from '@umami/react-zen';
import { useMessages, useOperatorLabels, useWebsiteSegmentQuery } from '@/components/hooks';
import { ListFilter } from '@/components/icons';
import type { BoardRowFilters } from '@/lib/types';

/**
 * Marks a panel whose data is narrowed by its row's saved filters, and spells
 * them out on hover.
 *
 * It lives in the panel header rather than above the row because row filters
 * resolve per column: only the columns showing the website the filters were
 * authored against are scoped, so the indicator has to mark the affected
 * panels instead of implying the whole row. Keeping it in the header also
 * leaves row heights untouched, so a filtered row still lines up with an
 * unfiltered one.
 *
 * Read-only by design — the filters are part of the board definition, so they
 * are edited through BoardRowFilterButton rather than removed one at a time
 * like the viewer's own FilterBar selection.
 */
export function BoardRowFilterIndicator({
  rowFilters,
  websiteId,
}: {
  rowFilters?: BoardRowFilters;
  websiteId?: string;
}) {
  const { t, labels } = useMessages();
  const operatorLabels = useOperatorLabels();
  const { filters = [], sessionPropertyFilters = [], segment, cohort } = rowFilters ?? {};
  const { data: segmentData } = useWebsiteSegmentQuery(websiteId, segment || cohort);

  const lines: { key: string; label: string; operator: string; value: string }[] = [];

  if (segment) {
    lines.push({
      key: 'segment',
      label: t(labels.segment),
      operator: operatorLabels.eq,
      value: segmentData?.name || segment,
    });
  }

  if (cohort) {
    lines.push({
      key: 'cohort',
      label: t(labels.cohort),
      operator: operatorLabels.eq,
      value: segmentData?.name || cohort,
    });
  }

  for (const filter of filters) {
    lines.push({
      key: `filter:${filter.name}:${filter.operator}:${filter.value}`,
      label: filter.name,
      operator: operatorLabels[filter.operator],
      value: Array.isArray(filter.value) ? filter.value.join(', ') : String(filter.value),
    });
  }

  for (const filter of sessionPropertyFilters) {
    lines.push({
      key: `session:${filter.propertyName}:${filter.operator}:${filter.value}`,
      label: `${t(labels.sessionData)}: ${filter.propertyName}`,
      operator: operatorLabels[filter.operator],
      value: filter.value,
    });
  }

  if (!lines.length) {
    return null;
  }

  // Also on the button, so the filters are reachable without hovering.
  const summary = lines.map(line => `${line.label} ${line.operator} ${line.value}`).join(', ');
  // The value is what distinguishes one row from the next, so it is the part
  // shown inline; the rest is a hover away. Without it a board of per-region
  // rows looks identical row to row.
  const [first] = lines;
  const overflow = lines.length - 1;

  return (
    <TooltipTrigger delay={0}>
      <Button
        size="sm"
        variant="quiet"
        aria-label={`${t(labels.filter)}: ${summary}`}
        data-test="board-row-filter-indicator"
      >
        <Icon size="sm">
          <ListFilter />
        </Icon>
        <Text
          size="sm"
          color="muted"
          style={{
            maxWidth: '160px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {overflow > 0 ? `${first.value} +${overflow}` : first.value}
        </Text>
      </Button>
      <Tooltip placement="top">
        <Column gap="1" data-test="board-row-filter-details">
          {lines.map(line => (
            <Row key={line.key} gap="2" alignItems="center" wrap="nowrap">
              <Text>{line.label}</Text>
              <Text>{line.operator}</Text>
              <Text weight="bold">{line.value}</Text>
            </Row>
          ))}
        </Column>
      </Tooltip>
    </TooltipTrigger>
  );
}
