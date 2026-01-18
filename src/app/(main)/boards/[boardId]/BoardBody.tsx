import { Box, Button, Column, Icon, Row, Tooltip, TooltipTrigger } from '@umami/react-zen';
import { produce } from 'immer';
import { Fragment, type ReactElement } from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { v4 as uuid } from 'uuid';
import { useBoard } from '@/components/hooks';
import { Minus, Plus } from '@/components/icons';
import type { BoardColumn as BoardColumnType } from '@/lib/types';

const CATALOG = {
  text: {
    label: 'Text',
    component: BoardColumn,
  },
};

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
    console.log('Removing row', id);
    updateBoard({
      parameters: produce(board.parameters, draft => {
        if (!draft.rows) {
          return;
        }

        draft.rows = draft.rows.filter(row => row?.id !== id);
      }),
    });
  };

  const rows = board?.parameters?.rows ?? [];
  const minHeight = 300 * (rows.length || 1);

  return (
    <>
      <Group orientation="vertical" style={{ minHeight }}>
        {rows.map((row, index) => (
          <Fragment key={row.id}>
            <Panel minSize={200}>
              <BoardRow {...row} rowId={row.id} onRemove={handleRemoveRow} />
            </Panel>
            {index < rows.length - 1 && <Separator />}
          </Fragment>
        ))}
      </Group>
      <Row>
        <TooltipTrigger delay={0}>
          <Button variant="outline" onPress={handleAddRow}>
            <Icon>
              <Plus />
            </Icon>
          </Button>
          <Tooltip placement="bottom">Add row</Tooltip>
        </TooltipTrigger>
      </Row>
    </>
  );
}

function BoardRow({
  rowId,
  columns,
  onRemove,
}: {
  rowId: string;
  columns: BoardColumnType[];
  onAddComponent?: () => void;
  onRemove?: (id: string) => void;
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
          <Panel minSize={300}>
            <BoardColumn {...column} />
          </Panel>
          {index < columns.length - 1 && <Separator />}
        </Fragment>
      ))}
      <Box alignSelf="center" padding="3">
        <Button variant="outline" onPress={handleAddColumn}>
          <Icon>
            <Plus />
          </Icon>
        </Button>
        <TooltipTrigger delay={0}>
          <Button variant="outline" onPress={() => onRemove?.(rowId)}>
            <Icon>
              <Minus />
            </Icon>
          </Button>
          <Tooltip placement="bottom">Remove row</Tooltip>
        </TooltipTrigger>
      </Box>
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
