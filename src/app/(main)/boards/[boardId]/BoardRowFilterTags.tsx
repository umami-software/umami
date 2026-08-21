import { Row, Text } from '@umami/react-zen';
import { useMessages, useOperatorLabels, useWebsiteSegmentQuery } from '@/components/hooks';
import type { BoardRowFilters } from '@/lib/types';
import { BoardEntityBadge } from '../BoardEntityBadge';
import { useBoardEntityBadgeProps } from '../useBoardEntityBadgeProps';

/**
 * Read-only chips describing a row's saved filters, so it's visible that the
 * row shows a subset. Editing happens in BoardRowFilterButton; unlike the
 * page-level FilterBar these chips have no remove buttons because the filters
 * belong to the board definition, not the viewer's session.
 */
export function BoardRowFilterTags({
  rowFilters,
  websiteId,
  showEntity = false,
}: {
  rowFilters?: BoardRowFilters;
  websiteId?: string;
  /**
   * Names the website the filters apply to. Set for rows that mix entities,
   * where the filters only scope some of the columns.
   */
  showEntity?: boolean;
}) {
  const { t, labels } = useMessages();
  const operatorLabels = useOperatorLabels();
  const { filters = [], sessionPropertyFilters = [], segment, cohort } = rowFilters ?? {};
  const { data: segmentData } = useWebsiteSegmentQuery(websiteId, segment || cohort);
  const entityBadge = useBoardEntityBadgeProps('website', websiteId, showEntity);

  if (!filters.length && !sessionPropertyFilters.length && !segment && !cohort) {
    return null;
  }

  return (
    <Row gap="2" alignItems="center" wrap="wrap" data-test="board-row-filter-tags">
      {entityBadge && <BoardEntityBadge {...entityBadge} />}
      {segment && (
        <FilterTag
          label={t(labels.segment)}
          operator={operatorLabels.eq}
          value={segmentData?.name || segment}
        />
      )}
      {cohort && (
        <FilterTag
          label={t(labels.cohort)}
          operator={operatorLabels.eq}
          value={segmentData?.name || cohort}
        />
      )}
      {filters.map(filter => (
        <FilterTag
          key={`${filter.name}:${filter.operator}:${filter.value}`}
          label={filter.name}
          operator={operatorLabels[filter.operator]}
          value={Array.isArray(filter.value) ? filter.value.join(', ') : filter.value}
        />
      ))}
      {sessionPropertyFilters.map(filter => (
        <FilterTag
          key={`${filter.propertyName}:${filter.operator}:${filter.value}`}
          label={`${t(labels.sessionData)}: ${filter.propertyName}`}
          operator={operatorLabels[filter.operator]}
          value={filter.value}
        />
      ))}
    </Row>
  );
}

function FilterTag({ label, operator, value }: { label: string; operator: string; value: string }) {
  return (
    <Row border padding="2" color backgroundColor borderRadius alignItems="center" gap="2">
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
  );
}
