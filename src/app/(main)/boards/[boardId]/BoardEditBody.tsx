import { Box, Button, Icon, Row, Tooltip, TooltipTrigger } from '@umami/react-zen';
import { produce } from 'immer';
import { Fragment, useEffect, useRef } from 'react';
import { Group, type GroupImperativeHandle, Panel, Separator } from 'react-resizable-panels';
import { v4 as uuid } from 'uuid';
import { useBoard } from '@/components/hooks';
import { GripHorizontal, Plus } from '@/components/icons';
import { BoardEditRow } from './BoardEditRow';
import { BUTTON_ROW_HEIGHT, MAX_ROW_HEIGHT, MIN_ROW_HEIGHT } from './boardConstants';

export function BoardEditBody({ requiresBoardWebsite = true }: { requiresBoardWebsite?: boolean }) {
  const { board, updateBoard, registerLayoutGetter } = useBoard();
  const rowGroupRef = useRef<GroupImperativeHandle>(null);
  const columnGroupRefs = useRef<Map<string, GroupImperativeHandle>>(new Map());

  useEffect(() => {
    registerLayoutGetter(() => {
      const rows = board?.parameters?.rows;

      if (!rows?.length) return null;

      const rowLayout = rowGroupRef.current?.getLayout();

      const updatedRows = rows.map(row => {
        const columnGroupRef = columnGroupRefs.current.get(row.id);
        const columnLayout = columnGroupRef?.getLayout();

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

  const handle = () => {
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

  const websiteId = board?.parameters?.websiteId;
  const canEdit = requiresBoardWebsite ? !!websiteId : true;
  const rows = board?.parameters?.rows ?? [];
  const minHeight = (rows.length || 1) * MAX_ROW_HEIGHT + BUTTON_ROW_HEIGHT;

  return (
    <Box minHeight={`${minHeight}px`}>
      <Group groupRef={rowGroupRef} orientation="vertical">
        {rows.map((row, index) => (
          <Fragment key={`${row.id}:${row.size ?? 'auto'}`}>
            <Panel
              id={row.id}
              minSize={MIN_ROW_HEIGHT}
              maxSize={MAX_ROW_HEIGHT}
              defaultSize={row.size != null ? `${row.size}%` : undefined}
            >
              <BoardEditRow
                {...row}
                rowId={row.id}
                rowIndex={index}
                rowCount={rows.length}
                canEdit={canEdit}
                onRemove={handleRemoveRow}
                onMoveUp={handleMoveRowUp}
                onMoveDown={handleMoveRowDown}
                onRegisterRef={registerColumnGroupRef}
              />
            </Panel>
            {index < rows.length - 1 && (
              <Separator
                style={{
                  height: '12px',
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
                  style={{ cursor: 'row-resize' }}
                >
                  <Icon size="sm">
                    <GripHorizontal />
                  </Icon>
                </Row>
              </Separator>
            )}
          </Fragment>
        ))}
        {canEdit && (
          <Panel minSize={BUTTON_ROW_HEIGHT}>
            <Row paddingY="3">
              <TooltipTrigger delay={0}>
                <Button variant="outline" onPress={handle}>
                  <Icon>
                    <Plus />
                  </Icon>
                </Button>
                <Tooltip placement="right" offset={8}>
                  Add row
                </Tooltip>
              </TooltipTrigger>
            </Row>
          </Panel>
        )}
      </Group>
    </Box>
  );
}
