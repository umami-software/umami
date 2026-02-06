import { Button, Column, Icon, Tooltip, TooltipTrigger } from '@umami/react-zen';
import { produce } from 'immer';
import { Fragment } from 'react';
import { Group, type GroupImperativeHandle, Panel, Separator } from 'react-resizable-panels';
import { v4 as uuid } from 'uuid';
import { useBoard } from '@/components/hooks';
import { ChevronDown, Minus, Plus } from '@/components/icons';
import type { BoardColumn as BoardColumnType } from '@/lib/types';
import { BoardColumn } from './BoardColumn';
import { MAX_COLUMNS, MIN_COLUMN_WIDTH } from './boardConstants';

export function BoardRow({
  rowId,
  rowIndex,
  rowCount,
  columns,
  editing = false,
  onRemove,
  onMoveUp,
  onMoveDown,
  onRegisterRef,
}: {
  rowId: string;
  rowIndex: number;
  rowCount: number;
  columns: BoardColumnType[];
  editing?: boolean;
  onRemove?: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  onRegisterRef?: (rowId: string, ref: GroupImperativeHandle | null) => void;
}) {
  const { board, updateBoard } = useBoard();

  const handleGroupRef = (ref: GroupImperativeHandle | null) => {
    onRegisterRef?.(rowId, ref);
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

  return (
    <Group groupRef={handleGroupRef} style={{ height: '100%' }}>
      {columns?.map((column, index) => (
        <Fragment key={column.id}>
          <Panel id={column.id} minSize={MIN_COLUMN_WIDTH} defaultSize={column.size}>
            <BoardColumn
              {...column}
              editing={editing}
              onRemove={handleRemoveColumn}
              canRemove={columns?.length > 1}
            />
          </Panel>
          {index < columns?.length - 1 && <Separator />}
        </Fragment>
      ))}
      {editing && (
        <Column alignSelf="center" padding="3" gap="1">
          <TooltipTrigger delay={0}>
            <Button variant="outline" onPress={() => onMoveUp?.(rowId)} isDisabled={rowIndex === 0}>
              <Icon rotate={180}>
                <ChevronDown />
              </Icon>
            </Button>
            <Tooltip placement="top">Move row up</Tooltip>
          </TooltipTrigger>
          <TooltipTrigger delay={0}>
            <Button
              variant="outline"
              onPress={handleAddColumn}
              isDisabled={columns?.length >= MAX_COLUMNS}
            >
              <Icon>
                <Plus />
              </Icon>
            </Button>
            <Tooltip placement="left">Add column</Tooltip>
          </TooltipTrigger>
          <TooltipTrigger delay={0}>
            <Button variant="outline" onPress={() => onRemove?.(rowId)}>
              <Icon>
                <Minus />
              </Icon>
            </Button>
            <Tooltip placement="left">Remove row</Tooltip>
          </TooltipTrigger>
          <TooltipTrigger delay={0}>
            <Button
              variant="outline"
              onPress={() => onMoveDown?.(rowId)}
              isDisabled={rowIndex === rowCount - 1}
            >
              <Icon>
                <ChevronDown />
              </Icon>
            </Button>
            <Tooltip placement="bottom">Move row down</Tooltip>
          </TooltipTrigger>
        </Column>
      )}
    </Group>
  );
}
