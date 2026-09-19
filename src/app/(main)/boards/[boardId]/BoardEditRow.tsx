import { Box, Button, Column, Icon, Row, Tooltip, TooltipTrigger } from '@umami/react-zen';
import { produce } from 'immer';
import { Fragment, useState } from 'react';
import {
  Group,
  type GroupImperativeHandle,
  Panel as ResizablePanel,
  Separator,
} from 'react-resizable-panels';
import { v4 as uuid } from 'uuid';
import { FilterScopeProvider } from '@/components/common/FilterScopeProvider';
import { useBoard } from '@/components/hooks';
import { ChevronDown, GripVertical, Minus, Plus } from '@/components/icons';
import { getResolvedComponentEntity } from '@/lib/boards';
import type {
  BoardColumn as BoardColumnType,
  BoardComponentConfig,
  BoardRowFilters,
} from '@/lib/types';
import { BoardEditColumn } from './BoardEditColumn';
import { BoardRowFilterButton } from './BoardRowFilterButton';
import { MAX_COLUMNS, MIN_COLUMN_WIDTH } from './boardConstants';
import { useBoardRowScope } from './useBoardRowScope';

export function BoardEditRow({
  rowId,
  rowIndex,
  rowCount,
  columns,
  filters,
  canEdit,
  onRemove,
  onMoveUp,
  onMoveDown,
  onRegisterRef,
}: {
  rowId: string;
  rowIndex: number;
  rowCount: number;
  columns: BoardColumnType[];
  filters?: BoardRowFilters;
  canEdit: boolean;
  onRemove: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onRegisterRef: (rowId: string, ref: GroupImperativeHandle | null) => void;
}) {
  const { board, updateBoard } = useBoard();
  const [showActions, setShowActions] = useState(false);
  const scope = useBoardRowScope(board, columns, filters);
  const moveUpDisabled = rowIndex === 0;
  const addColumnDisabled = columns.length >= MAX_COLUMNS;
  const moveDownDisabled = rowIndex === rowCount - 1;

  const handleGroupRef = (ref: GroupImperativeHandle | null) => {
    onRegisterRef(rowId, ref);
  };

  const handleAddColumn = () => {
    updateBoard({
      parameters: produce(board.parameters, draft => {
        const rowIndex = draft.rows.findIndex(row => row.id === rowId);
        const row = draft.rows[rowIndex];

        if (!row) {
          draft.rows[rowIndex] = { id: uuid(), columns: [] };
        }
        row.columns.push({ id: uuid(), component: null });
      }),
    });
  };

  const handleRemoveColumn = (columnId: string) => {
    updateBoard({
      parameters: produce(board.parameters, draft => {
        const row = draft.rows.find(row => row.id === rowId);
        if (row) {
          row.columns = row.columns.filter(col => col.id !== columnId);
        }
      }),
    });
  };

  const handleSetComponent = (columnId: string, config: BoardComponentConfig | null) => {
    updateBoard({
      parameters: produce(board.parameters, draft => {
        const row = draft.rows.find(row => row.id === rowId);
        if (row) {
          const col = row.columns.find(col => col.id === columnId);
          if (col) {
            col.component = config;
          }
        }
      }),
    });
  };

  const columnsGroup = (
    <Group groupRef={handleGroupRef}>
      {columns?.map((column, index) => (
        <Fragment key={`${column.id}:${column.size ?? 'auto'}`}>
          <ResizablePanel
            id={column.id}
            minSize={MIN_COLUMN_WIDTH}
            defaultSize={column.size != null ? `${column.size}%` : undefined}
          >
            {(() => {
              const { entityId } = getResolvedComponentEntity(board, column.component);
              const isScoped = scope.appliesTo(entityId);
              const content = (
                <BoardEditColumn
                  {...column}
                  canEdit={canEdit}
                  onRemove={handleRemoveColumn}
                  onSetComponent={handleSetComponent}
                  canRemove={columns.length > 1}
                  rowFilters={isScoped ? filters : undefined}
                  filterWebsiteId={scope.targetWebsiteId}
                />
              );

              return isScoped ? (
                <FilterScopeProvider params={scope.params}>{content}</FilterScopeProvider>
              ) : (
                content
              );
            })()}
          </ResizablePanel>
          {index < columns.length - 1 && (
            <Separator
              style={{
                width: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
                background: 'transparent',
              }}
            >
              <Row
                width="100%"
                height="100%"
                alignItems="center"
                justifyContent="center"
                style={{ cursor: 'col-resize' }}
              >
                <Icon size="sm">
                  <GripVertical />
                </Icon>
              </Row>
            </Separator>
          )}
        </Fragment>
      ))}
    </Group>
  );

  return (
    <Box
      position="relative"
      height="100%"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {columnsGroup}
      {canEdit && showActions && (
        <Column
          padding="2"
          gap="1"
          position="absolute"
          top="50%"
          right="12px"
          zIndex={20}
          backgroundColor="surface-sunken"
          borderRadius
          style={{ transform: 'translateY(-50%)' }}
        >
          <TooltipTrigger delay={0}>
            <Button
              variant="outline"
              onPress={() => onMoveUp(rowId)}
              isDisabled={moveUpDisabled}
              style={moveUpDisabled ? { pointerEvents: 'none' } : undefined}
            >
              <Icon rotate={180} color={moveUpDisabled ? 'muted' : undefined}>
                <ChevronDown />
              </Icon>
            </Button>
            <Tooltip placement="top">Move row up</Tooltip>
          </TooltipTrigger>
          <BoardRowFilterButton
            rowId={rowId}
            websiteId={scope.targetWebsiteId}
            rowFilters={filters}
            isActive={scope.hasFilters}
          />
          <TooltipTrigger delay={0}>
            <Button
              variant="outline"
              onPress={handleAddColumn}
              isDisabled={addColumnDisabled}
              style={addColumnDisabled ? { pointerEvents: 'none' } : undefined}
            >
              <Icon color={addColumnDisabled ? 'muted' : undefined}>
                <Plus />
              </Icon>
            </Button>
            <Tooltip placement="left">Add column</Tooltip>
          </TooltipTrigger>
          <TooltipTrigger delay={0}>
            <Button variant="outline" onPress={() => onRemove(rowId)}>
              <Icon>
                <Minus />
              </Icon>
            </Button>
            <Tooltip placement="left">Remove row</Tooltip>
          </TooltipTrigger>
          <TooltipTrigger delay={0}>
            <Button
              variant="outline"
              onPress={() => onMoveDown(rowId)}
              isDisabled={moveDownDisabled}
              style={moveDownDisabled ? { pointerEvents: 'none' } : undefined}
            >
              <Icon color={moveDownDisabled ? 'muted' : undefined}>
                <ChevronDown />
              </Icon>
            </Button>
            <Tooltip placement="bottom">Move row down</Tooltip>
          </TooltipTrigger>
        </Column>
      )}
    </Box>
  );
}
