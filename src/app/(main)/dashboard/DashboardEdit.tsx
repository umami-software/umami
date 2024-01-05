'use client';
import { useState, useMemo } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import classNames from 'classnames';
import { Button } from 'react-basics';
import { firstBy } from 'thenby';
import useDashboard, { saveDashboard } from 'store/dashboard';
import useMessages from 'components/hooks/useMessages';
import useApi from 'components/hooks/useApi';
import styles from './DashboardEdit.module.css';

const dragId = 'dashboard-website-ordering';

export function DashboardEdit() {
  const settings = useDashboard();
  const { websiteOrder } = settings;
  const { formatMessage, labels } = useMessages();
  const [order, setOrder] = useState(websiteOrder || []);
  const { get, useQuery } = useApi();
  const { data: result } = useQuery({
    queryKey: ['websites'],
    queryFn: () => get('/websites', { includeTeams: 1 }),
  });
  const { data: websites } = result || {};

  const ordered = useMemo(() => {
    if (websites) {
      return websites
        .map(website => ({ ...website, order: order.indexOf(website.id) }))
        .sort(firstBy('order'));
    }
    return [];
  }, [websites, order]);

  function handleWebsiteDrag({ destination, source }) {
    if (!destination || destination.index === source.index) return;

    const orderedWebsites = [...ordered];
    const [removed] = orderedWebsites.splice(source.index, 1);
    orderedWebsites.splice(destination.index, 0, removed);

    setOrder(orderedWebsites.map(website => website?.id || 0));
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
        <Button onClick={handleSave} variant="primary" size="sm">
          {formatMessage(labels.save)}
        </Button>
        <Button onClick={handleCancel} size="sm">
          {formatMessage(labels.cancel)}
        </Button>
        <Button onClick={handleReset} size="sm">
          {formatMessage(labels.reset)}
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
                {ordered.map(({ id, name, domain }, index) => (
                  <Draggable key={id} draggableId={`${dragId}-${id}`} index={index}>
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

export default DashboardEdit;
