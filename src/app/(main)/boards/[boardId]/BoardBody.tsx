import { Box, Button, Column, Icon, Row, Tooltip, TooltipTrigger } from '@umami/react-zen';
import { produce } from 'immer';
import { Fragment, type ReactElement, useEffect, useRef } from 'react';
import { Group, type GroupImperativeHandle, Panel, Separator } from 'react-resizable-panels';
import { v4 as uuid } from 'uuid';
import { useBoard } from '@/components/hooks';
import { ChevronDown, Minus, Plus, X } from '@/components/icons';
import type { BoardColumn as BoardColumnType } from '@/lib/types';

const CATALOG = {
  text: {
    label: 'Text',
    component: BoardColumn,
  },
};

const MIN_ROW_HEIGHT = 300;
const MAX_ROW_HEIGHT = 600;
const MIN_COLUMN_WIDTH = 300;
const BUTTON_ROW_HEIGHT = 60;
const MAX_COLUMNS = 4;

export function BoardBody() {
  const { board, updateBoard, saveBoard, isPending, registerLayoutGetter } = useBoard();
  const rowGroupRef = useRef<GroupImperativeHandle>(null);
  const columnGroupRefs = useRef<Map<string, GroupImperativeHandle>>(new Map());

  // Register a function to get current layout sizes on save
  useEffect(() => {
    registerLayoutGetter(() => {
      const rows = board?.parameters?.rows;
      console.log('Layout getter called, rows:', rows);
      console.log('rowGroupRef.current:', rowGroupRef.current);
      console.log('columnGroupRefs.current:', columnGroupRefs.current);

      if (!rows?.length) return null;

      const rowLayout = rowGroupRef.current?.getLayout();
      console.log('rowLayout:', rowLayout);

      const updatedRows = rows.map(row => {
        const columnGroupRef = columnGroupRefs.current.get(row.id);
        const columnLayout = columnGroupRef?.getLayout();
        console.log(`Row ${row.id} columnLayout:`, columnLayout);

        const updatedColumns = row.columns.map(col => ({
          ...col,
          size: columnLayout?.[col.id],
        }));

        return {
          ...row,
          size: rowLayout?.[row.id],
          columns: updatedColumns,
        };
      });

      console.log('updatedRows:', updatedRows);
      return { rows: updatedRows };
    });
  }, [registerLayoutGetter, board?.parameters?.rows]);

  const registerColumnGroupRef = (rowId: string, ref: GroupImperativeHandle | null) => {
    if (ref) {
      columnGroupRefs.current.set(rowId, ref);
    } else {
      columnGroupRefs.current.delete(rowId);
    }
  };

  console.log({ board });

  const handleAddRow = () => {
    updateBoard({
      parameters: produce(board.parameters, draft => {
        if (!draft.rows) {
          draft.rows = [];
        }
        draft.rows.push({ id: uuid(), columns: [{ id: uuid(), component: null }] });
      }),
    });
  };

  const handleRemoveRow = (id: string) => {
    updateBoard({
      parameters: produce(board.parameters, draft => {
        if (!draft.rows) {
          return;
        }

        draft.rows = draft.rows.filter(row => row?.id !== id);
      }),
    });
  };

  const handleMoveRowUp = (id: string) => {
    updateBoard({
      parameters: produce(board.parameters, draft => {
        if (!draft.rows) return;

        const index = draft.rows.findIndex(row => row.id === id);
        if (index > 0) {
          const temp = draft.rows[index - 1];
          draft.rows[index - 1] = draft.rows[index];
          draft.rows[index] = temp;
        }
      }),
    });
  };

  const handleMoveRowDown = (id: string) => {
    updateBoard({
      parameters: produce(board.parameters, draft => {
        if (!draft.rows) return;

        const index = draft.rows.findIndex(row => row.id === id);
        if (index < draft.rows.length - 1) {
          const temp = draft.rows[index + 1];
          draft.rows[index + 1] = draft.rows[index];
          draft.rows[index] = temp;
        }
      }),
    });
  };

  const rows = board?.parameters?.rows ?? [];
  const minHeight = (rows?.length || 1) * MAX_ROW_HEIGHT + BUTTON_ROW_HEIGHT;

  return (
    <Group groupRef={rowGroupRef} orientation="vertical" style={{ minHeight }}>
      {rows.map((row, index) => (
        <Fragment key={row.id}>
          <Panel
            id={row.id}
            minSize={MIN_ROW_HEIGHT}
            maxSize={MAX_ROW_HEIGHT}
            defaultSize={row.size}
          >
            <BoardRow
              {...row}
              rowId={row.id}
              rowIndex={index}
              rowCount={rows?.length}
              onRemove={handleRemoveRow}
              onMoveUp={handleMoveRowUp}
              onMoveDown={handleMoveRowDown}
              onRegisterRef={registerColumnGroupRef}
            />
          </Panel>
          {index < rows?.length - 1 && <Separator />}
        </Fragment>
      ))}
      <Panel minSize={BUTTON_ROW_HEIGHT}>
        <Row padding="3">
          <TooltipTrigger delay={0}>
            <Button variant="outline" onPress={handleAddRow}>
              <Icon>
                <Plus />
              </Icon>
            </Button>
            <Tooltip placement="bottom">Add row</Tooltip>
          </TooltipTrigger>
        </Row>
      </Panel>
    </Group>
  );
}

function BoardRow({
  rowId,
  rowIndex,
  rowCount,
  columns,
  onRemove,
  onMoveUp,
  onMoveDown,
  onRegisterRef,
}: {
  rowId: string;
  rowIndex: number;
  rowCount: number;
  columns: BoardColumnType[];
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
            <BoardColumn {...column} onRemove={handleRemoveColumn} />
          </Panel>
          {index < columns?.length - 1 && <Separator />}
        </Fragment>
      ))}
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
    </Group>
  );
}

function BoardColumn({
  id,
  component,
  onRemove,
}: {
  id: string;
  component?: ReactElement;
  onRemove?: (id: string) => void;
}) {
  const handleAddComponent = () => {};

  return (
    <Column
      marginTop="3"
      marginLeft="3"
      width="100%"
      height="100%"
      alignItems="center"
      justifyContent="center"
      backgroundColor="3"
      position="relative"
    >
      <Box position="absolute" top="10px" right="20px" zIndex={100}>
        <TooltipTrigger delay={0}>
          <Button variant="quiet" onPress={() => onRemove?.(id)}>
            <Icon size="sm">
              <X />
            </Icon>
          </Button>
          <Tooltip>Remove column</Tooltip>
        </TooltipTrigger>
      </Box>
      <Button variant="outline" onPress={handleAddComponent}>
        <Icon>
          <Plus />
        </Icon>
      </Button>
    </Column>
  );
}
