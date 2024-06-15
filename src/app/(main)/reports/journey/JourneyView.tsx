import { useContext, useMemo, useState } from 'react';
import { TooltipPopup } from 'react-basics';
import { firstBy } from 'thenby';
import classNames from 'classnames';
import { useEscapeKey, useMessages } from 'components/hooks';
import { objectToArray } from 'lib/data';
import { ReportContext } from '../[reportId]/Report';
// eslint-disable-next-line css-modules/no-unused-class
import styles from './JourneyView.module.css';

const NODE_HEIGHT = 60;
const NODE_GAP = 10;
const LINE_WIDTH = 3;

export default function JourneyView() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeNode, setActiveNode] = useState(null);
  const { report } = useContext(ReportContext);
  const { data, parameters } = report || {};
  const { formatMessage, labels } = useMessages();

  useEscapeKey(() => setSelectedNode(null));

  const columns = useMemo(() => {
    if (!data) {
      return [];
    }

    const selectedPaths = selectedNode?.paths ?? [];
    const activePaths = activeNode?.paths ?? [];
    const columns = [];

    for (let columnIndex = 0; columnIndex < +parameters.steps; columnIndex++) {
      const nodes = {};

      data.forEach(({ items, count }: any, nodeIndex: any) => {
        const name = items[columnIndex];

        if (name) {
          const selected = !!selectedPaths.find(path => path.items[columnIndex] === name);
          const active = selected && !!activePaths.find(path => path.items[columnIndex] === name);

          if (!nodes[name]) {
            const paths = data.filter((d, i) => {
              return i !== columnIndex && d.items[columnIndex] === name;
            });

            const from =
              columnIndex > 0 &&
              selected &&
              paths.reduce((obj, path) => {
                const { items, count } = path;
                const name = items[columnIndex - 1];

                if (!obj[name]) {
                  obj[name] = { name, count };
                } else {
                  obj[name].count += count;
                }

                return obj;
              }, {});

            nodes[name] = {
              name,
              count,
              totalCount: count,
              nodeIndex,
              columnIndex,
              selected,
              active,
              paths,
              from: objectToArray(from),
            };
          } else {
            nodes[name].totalCount += count;
          }
        }
      });

      columns.push({
        nodes: objectToArray(nodes).sort(firstBy('total', -1)),
      });
    }

    columns.forEach((column, columnIndex) => {
      const nodes = column.nodes.map((node, nodeIndex) => {
        const { from, totalCount } = node;
        const previousNodes = columns[columnIndex - 1]?.nodes;
        let selectedCount = from?.length ? 0 : totalCount;
        let activeCount = selectedCount;

        const lines = from?.reduce((arr: any[][], { name, count }: any) => {
          const fromIndex = previousNodes.findIndex((node: { name: any; selected: any }) => {
            return node.name === name && node.selected;
          });

          if (fromIndex > -1) {
            arr.push([fromIndex, nodeIndex]);
            selectedCount += count;
          }

          if (
            previousNodes.findIndex(node => {
              return node.name === name && node.active;
            }) > -1
          ) {
            activeCount += count;
          }

          return arr;
        }, []);

        return { ...node, selectedCount, activeCount, lines };
      });

      const visitorCount = nodes.reduce(
        (sum: number, { selected, selectedCount, active, activeCount, totalCount }) => {
          if (!selectedNode) {
            sum += totalCount;
          } else if (!activeNode && selected) {
            sum += selectedCount;
          } else if (active) {
            sum += activeCount;
          }
          return sum;
        },
        0,
      );

      const previousTotal = columns[columnIndex - 1]?.visitorCount ?? 0;
      const dropOff =
        previousTotal > 0 ? ((visitorCount - previousTotal) / previousTotal) * 100 : 0;

      Object.assign(column, { nodes, visitorCount, dropOff });
    });

    return columns;
  }, [data, selectedNode, activeNode]);

  const handleClick = (name: string, index: number, paths: any[]) => {
    if (name !== selectedNode?.name || index !== selectedNode?.index) {
      setSelectedNode({ name, index, paths });
    } else {
      setSelectedNode(null);
    }
    setActiveNode(null);
  };

  if (!data) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.view}>
        {columns.map((column, columnIndex) => {
          const dropOffPercent = `${~~column.dropOff}%`;
          return (
            <div
              key={columnIndex}
              className={classNames(styles.column, {
                [styles.selected]: selectedNode,
                [styles.active]: activeNode,
              })}
            >
              <div className={styles.header}>
                <div className={styles.num}>{columnIndex + 1}</div>
                <div className={styles.stats}>
                  <div className={styles.visitors}>
                    {column.visitorCount} {formatMessage(labels.visitors)}
                  </div>
                  {columnIndex > 0 && <div className={styles.dropoff}>{dropOffPercent}</div>}
                </div>
              </div>
              <div className={styles.nodes}>
                {column.nodes.map(
                  ({
                    name,
                    totalCount,
                    selected,
                    active,
                    paths,
                    activeCount,
                    selectedCount,
                    lines,
                  }) => {
                    return (
                      <div
                        key={name}
                        className={classNames(styles.item, {
                          [styles.selected]: selected,
                          [styles.active]: active,
                        })}
                        onClick={() => handleClick(name, columnIndex, paths)}
                        onMouseEnter={() => selected && setActiveNode({ name, columnIndex, paths })}
                        onMouseLeave={() => selected && setActiveNode(null)}
                      >
                        <div className={styles.name}>{name}</div>
                        <TooltipPopup label={dropOffPercent} disabled={!selected}>
                          <div className={styles.count}>
                            {selected ? (active ? activeCount : selectedCount) : totalCount}
                          </div>
                        </TooltipPopup>
                        {columnIndex < columns.length &&
                          lines.map(([fromIndex, nodeIndex], i) => {
                            const height =
                              (Math.abs(nodeIndex - fromIndex) + 1) * (NODE_HEIGHT + NODE_GAP) -
                              NODE_GAP;
                            const midHeight =
                              (Math.abs(nodeIndex - fromIndex) - 1) * (NODE_HEIGHT + NODE_GAP) +
                              NODE_GAP +
                              LINE_WIDTH;
                            const nodeName = columns[columnIndex - 1]?.nodes[fromIndex].name;

                            return (
                              <div
                                key={`${fromIndex}${nodeIndex}${i}`}
                                className={classNames(styles.line, {
                                  [styles.active]:
                                    active &&
                                    activeNode?.paths.find(
                                      path =>
                                        path.items[columnIndex] === name &&
                                        path.items[columnIndex - 1] === nodeName,
                                    ),
                                  [styles.up]: fromIndex < nodeIndex,
                                  [styles.down]: fromIndex > nodeIndex,
                                  [styles.flat]: fromIndex === nodeIndex,
                                })}
                                style={{ height }}
                              >
                                <div className={classNames(styles.segment, styles.start)} />
                                <div
                                  className={classNames(styles.segment, styles.mid)}
                                  style={{
                                    height: midHeight,
                                  }}
                                />
                                <div className={classNames(styles.segment, styles.end)} />
                              </div>
                            );
                          })}
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
