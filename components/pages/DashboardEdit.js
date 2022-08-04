import { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import useDashboard, { saveDashboard } from 'store/dashboard';
import Button from 'components/common/Button';
import { useMemo } from 'react';
import { orderByWebsiteMap } from 'lib/format';
import styles from './DashboardEdit.module.css';
import classNames from 'classnames';

const messages = defineMessages({
  save: { id: 'label.save', defaultMessage: 'Save' },
  reset: { id: 'label.reset', defaultMessage: 'Reset' },
  cancel: { id: 'label.cancel', defaultMessage: 'Cancel' },
});

const dragId = 'dashboard-website-ordering';

export default function DashboardEdit({ data: websites }) {
  const settings = useDashboard();
  const { websiteOrder } = settings;
  const { formatMessage } = useIntl();
  const [order, setOrder] = useState(websiteOrder);

  const ordered = useMemo(() => orderByWebsiteMap(websites, order), [websites, order]);

  console.log({ order, ordered });

  function handleWebsiteDrag({ destination, source }) {
    if (!destination || destination.index === source.index) return;

    const orderedWebsites = [...ordered];
    const [removed] = orderedWebsites.splice(source.index, 1);
    orderedWebsites.splice(destination.index, 0, removed);

    setOrder(
      orderedWebsites.map((i, k) => ({ [i.website_uuid]: k })).reduce((a, b) => ({ ...a, ...b })),
    );
  }

  function handleSave() {
    saveDashboard({
      editing: false,
      websiteOrder: order,
    });
  }

  function handleCancel() {
    saveDashboard({ editing: false, websiteOrder });
  }

  function handleReset() {
    setOrder({});
  }

  return (
    <>
      <div className={styles.buttons}>
        <Button onClick={handleSave} variant="action" size="small">
          {formatMessage(messages.save)}
        </Button>
        <Button onClick={handleCancel} size="small">
          {formatMessage(messages.cancel)}
        </Button>
        <Button onClick={handleReset} size="small">
          {formatMessage(messages.reset)}
        </Button>
      </div>
      <div className={styles.dragActive}>
        <DragDropContext onDragEnd={handleWebsiteDrag}>
          <Droppable droppableId={dragId}>
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{ marginBottom: snapshot.isDraggingOver ? 260 : null }}
              >
                {ordered.map(({ website_id, name, domain }, index) => (
                  <Draggable key={website_id} draggableId={`${dragId}-${website_id}`} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        className={classNames(styles.item, {
                          [styles.active]: snapshot.isDragging,
                        })}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <div className={styles.text}>
                          <h1>{name}</h1>
                          <h2>{domain}</h2>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </>
  );
}
