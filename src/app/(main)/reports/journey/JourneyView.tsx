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

    return Array(Number(parameters.steps))
      .fill(undefined)
      .map((nodes = {}, index) => {
        data.forEach(({ items, count }) => {
          const name = items[index];

          if (name) {
            const selected = !!selectedPaths.find(path => path.items[index] === name);
            const active = selected && !!activePaths.find(path => path.items[index] === name);

            if (!nodes[name]) {
              const paths = data.filter((d, i) => {
                return i !== index && d.items[index] === name;
              });

              const from =
                index > 0 &&
                selected &&
                paths.reduce((obj, path) => {
                  const { items, count } = path;
                  const name = items[index - 1];

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
                total: count,
                columnIndex: index,
                selected,
                active,
                paths,
                from: objectToArray(from),
              };
            } else {
              nodes[name].total += count;
            }
          }
        });

        const nodesArray = objectToArray(nodes).sort(firstBy('total', -1));

        return {
          nodes: nodesArray,
          visitors: nodesArray.reduce((sum, { selected, total }) => {
            if (!selectedNode || (selectedNode && selected)) {
              sum += total;
            }
            return sum;
          }, 0),
        };
      });
  }, [data, selectedNode, activeNode]);

  const handleClick = (name: string, index: number, paths: any[]) => {
    if (name !== selectedNode?.name || index !== selectedNode?.index) {
      setSelectedNode({ name, index, paths });
    } else {
      setSelectedNode(null);
      setActiveNode(null);
    }
  };

  if (!data) {
    return null;
  }

  //console.log({ data, columns, selectedNode, activeNode });

  return (
    <div className={styles.container}>
      <div className={styles.view}>
        {columns.map((column, columnIndex) => {
          const previousTotal = columns[columnIndex - 1]?.visitors ?? 0;
          const dropOff =
            previousTotal > 0 ? ((column.visitors - previousTotal) / previousTotal) * 100 : 0;

          return (
            <div
              key={columnIndex}
              className={classNames(styles.column, { [styles.active]: activeNode })}
            >
              <div className={styles.header}>
                <div className={styles.num}>{columnIndex + 1}</div>
                <div className={styles.stats}>
                  <div className={styles.visitors}>
                    {column.visitors} {formatMessage(labels.visitors)}
                  </div>
                  {columnIndex > 0 && <div className={styles.dropoff}>{`${~~dropOff}%`}</div>}
                </div>
              </div>
              <div className={styles.nodes}>
                {column.nodes.map(({ name, total, selected, active, paths, from }, nodeIndex) => {
                  const previousNodes = columns[columnIndex - 1]?.nodes;
                  let selectedCount = from?.length ? 0 : total;
                  let activeCount = selectedCount;

                  const lines = from?.reduce((arr, { name, count }: any) => {
                    const fromIndex = previousNodes.findIndex(node => {
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
                      <TooltipPopup label="hi" disabled={!selected}>
                        <div className={styles.count}>
                          {selected ? (active ? activeCount : selectedCount) : total}
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
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
