import { Box, Button, Column, Icon, Row, Tooltip, TooltipTrigger } from '@umami/react-zen';
import { produce } from 'immer';
import { Fragment, type ReactElement } from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { v4 as uuid } from 'uuid';
import { useBoard } from '@/components/hooks';
import { ChevronDown, Minus, Plus } from '@/components/icons';
import type { BoardColumn as BoardColumnType } from '@/lib/types';

const CATALOG = {
  text: {
    label: 'Text',
    component: BoardColumn,
  },
};

const MIN_HEIGHT = 300;
const MAX_HEIGHT = 600;
const MIN_WIDTH = 300;
const MARGIN = 10;
const MAX_COLUMNS = 4;

export function BoardBody() {
  const { board, updateBoard, saveBoard, isPending } = useBoard();

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
  const rowCount = (rows.length || 1) + 1;
  const minHeight = (MAX_HEIGHT + MARGIN) * rowCount;

  return (
    <Group orientation="vertical" style={{ minHeight }}>
      {rows.map((row, index) => (
        <Fragment key={row.id}>
          <Panel minSize={MIN_HEIGHT}>
            <BoardRow
              {...row}
              rowId={row.id}
              rowIndex={index}
              rowCount={rows.length}
              onRemove={handleRemoveRow}
              onMoveUp={handleMoveRowUp}
              onMoveDown={handleMoveRowDown}
            />
          </Panel>
          {index < rows.length - 1 && <Separator />}
        </Fragment>
      ))}
      <Panel>
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
}: {
  rowId: string;
  rowIndex: number;
  rowCount: number;
  columns: BoardColumnType[];
  onRemove?: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
}) {
  const { board, updateBoard } = useBoard();

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

  return (
    <Group style={{ height: '100%' }}>
      {columns?.map((column, index) => (
        <Fragment key={column.id}>
          <Panel minSize={MIN_HEIGHT}>
            <BoardColumn {...column} />
          </Panel>
          {index < columns.length - 1 && <Separator />}
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
            isDisabled={columns.length >= MAX_COLUMNS}
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

function BoardColumn({ id, component }: { id: string; component?: ReactElement }) {
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
    >
      <Button variant="outline" onPress={handleAddComponent}>
        <Icon>
          <Plus />
        </Icon>
      </Button>
    </Column>
  );
}
