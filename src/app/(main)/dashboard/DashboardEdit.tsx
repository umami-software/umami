import { useState, useMemo, useEffect } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import classNames from 'classnames';
import { Button, Icon, Loading } from 'react-basics';
import Icons from 'components/icons';
import { firstBy } from 'thenby';
import useDashboard, { saveDashboard } from 'store/dashboard';
import { useMessages, useWebsites } from 'components/hooks';
import styles from './DashboardEdit.module.css';

const DRAG_ID = 'dashboard-website-ordering';

export function DashboardEdit({ teamId }: { teamId: string }) {
  const settings = useDashboard();
  const { websiteOrder, websiteActive, isEdited } = settings;
  const { formatMessage, labels } = useMessages();
  const [order, setOrder] = useState(websiteOrder || []);
  const [active, setActive] = useState(websiteActive || []);
  const [edited, setEdited] = useState(isEdited);
  const [websites, setWebsites] = useState([]);

  const {
    result,
    query: { isLoading },
    setParams,
  } = useWebsites({ teamId });

  useEffect(() => {
    if (result?.data) {
      setWebsites(prevWebsites => {
        const newWebsites = [...prevWebsites, ...result.data];
        if (newWebsites.length < result.count) {
          setParams(prevParams => ({ ...prevParams, page: prevParams.page + 1 }));
        }
        return newWebsites;
      });
    }
  }, [result]);

  const ordered = useMemo(() => {
    if (websites) {
      return websites
        .map((website: { id: any; name: string; domain: string }) => ({
          ...website,
          order: order.indexOf(website.id),
        }))
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
    setEdited(true);
  }

  function handleActiveWebsites(id: string) {
    setActive(prevActive =>
      prevActive.includes(id) ? prevActive.filter(a => a !== id) : [...prevActive, id],
    );
    setEdited(true);
  }

  function handleSave() {
    saveDashboard({
      editing: false,
      isEdited: edited,
      websiteOrder: order,
      websiteActive: active,
    });
  }

  function handleCancel() {
    saveDashboard({ editing: false, websiteOrder, websiteActive, isEdited });
  }

  function handleReset() {
    setOrder([]);
    setActive([]);
    setEdited(false);
  }

  if (isLoading) {
    return <Loading />;
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
          <Droppable droppableId={DRAG_ID}>
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{ marginBottom: snapshot.isDraggingOver ? 260 : null }}
              >
                {ordered.map(({ id, name, domain }, index) => (
                  <Draggable key={id} draggableId={`${DRAG_ID}-${id}`} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        className={classNames(styles.item, {
                          [styles.active]: snapshot.isDragging,
                          [styles.websiteActive]: active.includes(id),
                        })}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <div className={styles.text}>
                          <div className={styles.pinActive}>
                            <Button size="sm" onClick={() => handleActiveWebsites(id)}>
                              <Icon rotate={active.includes(id) ? 0 : 45}>
                                <Icons.PushPin />
                              </Icon>
                            </Button>
                          </div>
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
