import { useState, useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import classNames from 'classnames';
import Button from 'components/common/Button';
import { firstBy } from 'thenby';
import useDashboard, { saveDashboard } from 'store/dashboard';
import styles from './DashboardEdit.module.css';

const messages = defineMessages({
  save: { id: 'label.save', defaultMessage: 'Save' },
  reset: { id: 'label.reset', defaultMessage: 'Reset' },
  cancel: { id: 'label.cancel', defaultMessage: 'Cancel' },
});

const dragId = 'dashboard-website-ordering';

export default function DashboardEdit({ websites }) {
  const settings = useDashboard();
  const { websiteOrder } = settings;
  const { formatMessage } = useIntl();
  const [order, setOrder] = useState(websiteOrder || []);

  const ordered = useMemo(
    () =>
      websites
        .map(website => ({ ...website, order: order.indexOf(website.websiteId) }))
        .sort(firstBy('order')),
    [websites, order],
  );

  function handleWebsiteDrag({ destination, source }) {
    if (!destination || destination.index === source.index) return;

    const orderedWebsites = [...ordered];
    const [removed] = orderedWebsites.splice(source.index, 1);
    orderedWebsites.splice(destination.index, 0, removed);

    setOrder(orderedWebsites.map(website => website?.websiteId || 0));
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
    setOrder([]);
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
                {ordered.map(({ websiteId, name, domain }, index) => (
                  <Draggable key={websiteId} draggableId={`${dragId}-${websiteId}`} index={index}>
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
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </>
  );
}
