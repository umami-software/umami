import { Button, Column, Icon, Row } from '@umami/react-zen';
import { produce } from 'immer';
import { v4 as uuid } from 'uuid';
import { useBoard } from '@/components/hooks';
import { Plus } from '@/components/icons';

export function BoardBody() {
  const { board, updateBoard, saveBoard, isPending } = useBoard();

  console.log({ board });

  const handleAddRow = () => {
    updateBoard({
      parameters: produce(board.parameters, draft => {
        if (!draft.rows) {
          draft.rows = [];
        }
        draft.rows.push({ id: uuid(), components: [] });
      }),
    });
  };

  return (
    <Column>
      {board?.parameters?.rows?.map((row, rowIndex) => {
        return <BoardRow key={row.id} rowIndex={rowIndex} components={row.components} />;
      })}
      <Row>
        <Button variant="outline" onPress={handleAddRow}>
          <Icon>
            <Plus />
          </Icon>
        </Button>
      </Row>
    </Column>
  );
}

function BoardComponent() {
  return <Column>hi</Column>;
}

function BoardRow({ rowIndex, components }: { rowIndex: number; components: any[] }) {
  const { board, updateBoard } = useBoard();

  const handleAddComponent = () => {
    updateBoard({
      parameters: produce(board.parameters, draft => {
        if (!draft.rows[rowIndex]) {
          draft.rows[rowIndex] = { id: uuid(), components: [] };
        }
        draft.rows[rowIndex].components.push({ id: uuid(), type: 'text', value: '' });
      }),
    });
  };

  return (
    <Row>
      {components?.map(component => {
        return <BoardComponent key={component.id} />;
      })}
      <Button variant="outline" onPress={handleAddComponent}>
        <Icon>
          <Plus />
        </Icon>
      </Button>
    </Row>
  );
}
