import { Column, Icon, Row, Text } from '@umami/react-zen';
import { produce } from 'immer';
import { useBoard, useMessages } from '@/components/hooks';
import { ListFilter, TriangleAlert } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import { FilterEditForm, type FilterEditFormProps } from '@/components/input/FilterEditForm';
import type { BoardRowFilters } from '@/lib/types';

const STALE_MESSAGE =
  'These filters were set for a website no longer in this row, so they are not applied.';

/**
 * Edits the filters saved on a single board row. Reuses the page-level filter
 * dialog, but writes the result into the board's parameters instead of the URL
 * so it is saved with the board and applies to that row alone.
 */
export function BoardRowFilterButton({
  rowId,
  websiteId,
  rowFilters,
  isActive,
  isStale,
  isDisabled,
}: {
  rowId: string;
  websiteId?: string;
  rowFilters?: BoardRowFilters;
  /** Highlights the button so a row that already carries filters reads as such. */
  isActive?: boolean;
  /** The saved filters target a website no longer in the row, so apply nowhere. */
  isStale?: boolean;
  isDisabled?: boolean;
}) {
  const { board, updateBoard } = useBoard();
  const { t, labels } = useMessages();

  const handleChange: FilterEditFormProps['onChange'] = ({
    filters,
    sessionPropertyFilters,
    segment,
    cohort,
    match,
  }) => {
    const nextFilters: BoardRowFilters = {
      // Recorded so the row applies its filters only to the columns showing
      // this website: session properties, segments and cohorts belong to it.
      ...(websiteId ? { websiteId } : {}),
      ...(filters?.length ? { filters } : {}),
      ...(sessionPropertyFilters?.length ? { sessionPropertyFilters } : {}),
      ...(segment ? { segment } : {}),
      ...(cohort ? { cohort } : {}),
      ...(match ? { match } : {}),
    };

    updateBoard({
      parameters: produce(board.parameters, draft => {
        const row = draft.rows?.find(row => row.id === rowId);

        if (row) {
          // Drop the key entirely when cleared, so an untouched row stays
          // identical to one saved before this feature existed.
          // websiteId alone is bookkeeping, not a filter — drop the whole set.
          const { websiteId: _websiteId, ...rest } = nextFilters;
          row.filters = Object.keys(rest).length ? nextFilters : undefined;
        }
      }),
    });
  };

  return (
    <DialogButton
      icon={isStale ? <TriangleAlert /> : <ListFilter />}
      title={t(labels.filter)}
      aria-label={isStale ? `${t(labels.filter)}: ${STALE_MESSAGE}` : t(labels.filter)}
      variant={isActive ? 'primary' : 'outline'}
      height="min(80dvh, calc(100dvh - 40px))"
      isDisabled={isDisabled}
      data-test="board-row-filter-button"
    >
      {({ close }) => (
        <Column gap="4" style={{ flex: 1, minHeight: 0 }}>
          {isStale && (
            <Row gap="2" alignItems="center" data-test="board-row-filter-stale">
              <Icon size="sm">
                <TriangleAlert />
              </Icon>
              <Text color="muted">{STALE_MESSAGE}</Text>
            </Row>
          )}
          <FilterEditForm
            websiteId={websiteId}
            defaultValues={rowFilters}
            onChange={handleChange}
            onClose={close}
          />
        </Column>
      )}
    </DialogButton>
  );
}
