import { produce } from 'immer';
import { useBoard, useMessages } from '@/components/hooks';
import { ListFilter } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import { FilterEditForm, type FilterEditFormProps } from '@/components/input/FilterEditForm';
import type { BoardRowFilters } from '@/lib/types';

/**
 * Edits the filters saved on a single board row. Reuses the page-level filter
 * dialog, but writes the result into the board's parameters instead of the URL
 * so it is saved with the board and applies to that row alone.
 */
export function BoardRowFilterButton({
  rowId,
  websiteId,
  rowFilters,
}: {
  rowId: string;
  websiteId?: string;
  rowFilters?: BoardRowFilters;
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
          row.filters = Object.keys(nextFilters).length ? nextFilters : undefined;
        }
      }),
    });
  };

  return (
    <DialogButton
      icon={<ListFilter />}
      title={t(labels.filter)}
      aria-label={t(labels.filter)}
      variant="outline"
      height="min(80dvh, calc(100dvh - 40px))"
    >
      {({ close }) => (
        <FilterEditForm
          websiteId={websiteId}
          defaultValues={rowFilters}
          onChange={handleChange}
          onClose={close}
        />
      )}
    </DialogButton>
  );
}
