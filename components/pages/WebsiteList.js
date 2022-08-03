import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { FormattedMessage } from 'react-intl';
import Link from 'components/common/Link';
import WebsiteChart from 'components/metrics/WebsiteChart';
import Page from 'components/layout/Page';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import Arrow from 'assets/arrow-right.svg';
import styles from './WebsiteList.module.css';
import { orderByWebsiteMap } from 'lib/format';
import { useMemo } from 'react';
import useStore, { setDashboard } from 'store/app';

const selector = state => state.dashboard;

export default function WebsiteList({ websites, showCharts, limit }) {
  const store = useStore(selector);
  const { websiteOrdering, changeOrderMode } = store;

  const ordered = useMemo(
    () => orderByWebsiteMap(websites, websiteOrdering),
    [websites, websiteOrdering],
  );

  const dragId = 'dashboard-website-ordering';

  function handleWebsiteDrag({ destination, source }) {
    if (!destination || destination.index === source.index) return;

    const orderedWebsites = [...ordered];
    const [removed] = orderedWebsites.splice(source.index, 1);
    orderedWebsites.splice(destination.index, 0, removed);

    setDashboard({
      ...store,
      websiteOrdering: orderedWebsites
        .map((i, k) => ({ [i.website_uuid]: k }))
        .reduce((a, b) => ({ ...a, ...b })),
    });
  }

  if (websites.length === 0) {
    return (
      <Page>
        <EmptyPlaceholder
          msg={
            <FormattedMessage
              id="message.no-websites-configured"
              defaultMessage="You don't have any websites configured."
            />
          }
        >
          <Link href="/settings" icon={<Arrow />} iconRight>
            <FormattedMessage id="message.go-to-settings" defaultMessage="Go to settings" />
          </Link>
        </EmptyPlaceholder>
      </Page>
    );
  }

  return (
    <div className={changeOrderMode && styles.websiteDragActive}>
      {changeOrderMode ? (
        <DragDropContext onDragEnd={handleWebsiteDrag}>
          <Droppable droppableId={dragId}>
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{ marginBottom: snapshot.isDraggingOver ? 260 : null }}
              >
                {ordered.map(({ website_id, name, domain }, index) =>
                  index < limit ? (
                    <Draggable
                      key={website_id}
                      draggableId={`${dragId}-${website_id}`}
                      index={index}
                    >
                      {provided => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={styles.website}
                        >
                          <WebsiteChart
                            websiteId={website_id}
                            title={name}
                            domain={domain}
                            showChart={changeOrderMode ? false : showCharts}
                            showLink
                          />
                        </div>
                      )}
                    </Draggable>
                  ) : null,
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        ordered.map(({ website_id, name, domain }, index) =>
          index < limit ? (
            <div key={website_id} className={styles.website}>
              <WebsiteChart
                websiteId={website_id}
                title={name}
                domain={domain}
                showChart={showCharts}
                showLink
              />
            </div>
          ) : null,
        )
      )}
    </div>
  );
}
