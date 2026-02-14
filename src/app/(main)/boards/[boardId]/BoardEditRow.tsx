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
import { useBoard } from '@/components/hooks';
import { ChevronDown, GripVertical, Minus, Plus } from '@/components/icons';
import type { BoardColumn as BoardColumnType, BoardComponentConfig } from '@/lib/types';
import { BoardEditColumn } from './BoardEditColumn';
import { MAX_COLUMNS, MIN_COLUMN_WIDTH } from './boardConstants';

export function BoardEditRow({
  rowId,
  rowIndex,
  rowCount,
  columns,
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
  canEdit: boolean;
  onRemove: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onRegisterRef: (rowId: string, ref: GroupImperativeHandle | null) => void;
}) {
  const { board, updateBoard } = useBoard();
  const [showActions, setShowActions] = useState(false);

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

  return (
    <Box
      position="relative"
      height="100%"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <Group groupRef={handleGroupRef}>
        {columns?.map((column, index) => (
          <Fragment key={`${column.id}:${column.size ?? 'auto'}`}>
            <ResizablePanel
              id={column.id}
              minSize={MIN_COLUMN_WIDTH}
              defaultSize={column.size != null ? `${column.size}%` : undefined}
            >
              <BoardEditColumn
                {...column}
                canEdit={canEdit}
                onRemove={handleRemoveColumn}
                onSetComponent={handleSetComponent}
                canRemove={columns.length > 1}
              />
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
            <Button variant="outline" onPress={() => onMoveUp(rowId)} isDisabled={rowIndex === 0}>
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
              isDisabled={columns.length >= MAX_COLUMNS}
            >
              <Icon>
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
    </Box>
  );
}
