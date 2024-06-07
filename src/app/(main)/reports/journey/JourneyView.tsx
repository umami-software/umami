import { useContext, useMemo, useState } from 'react';
import { firstBy } from 'thenby';
import classNames from 'classnames';
import { useEscapeKey } from 'components/hooks';
import { objectToArray } from 'lib/data';
import { ReportContext } from '../[reportId]/Report';
// eslint-disable-next-line css-modules/no-unused-class
import styles from './JourneyView.module.css';

const NODE_HEIGHT = 60;
const NODE_GAP = 10;
const BAR_OFFSET = 3;

export default function JourneyView() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeNode, setActiveNode] = useState(null);
  const { report } = useContext(ReportContext);
  const { data, parameters } = report || {};

  useEscapeKey(() => setSelectedNode(null));

  const columns = useMemo(() => {
    if (!data) {
      return [];
    }
    return Array(Number(parameters.steps))
      .fill(undefined)
      .map((column = {}, index) => {
        data.forEach(({ items, count }) => {
          const name = items[index];
          const selectedNodes = selectedNode?.paths ?? [];

          if (name) {
            if (!column[name]) {
              const selected = !!selectedNodes.find(a => a.items[index] === name);
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
                    obj[name] = { name, count: +count };
                  } else {
                    obj[name].count += +count;
                  }
                  return obj;
                }, {});
              const to =
                selected &&
                paths.reduce((obj, path) => {
                  const { items, count } = path;
                  const name = items[index + 1];
                  if (name) {
                    if (!obj[name]) {
                      obj[name] = { name, count: +count };
                    } else {
                      obj[name].count += +count;
                    }
                  }
                  return obj;
                }, {});

              column[name] = {
                name,
                total: +count,
                columnIndex: index,
                selected,
                paths,
                from: objectToArray(from),
                to: objectToArray(to),
              };
            } else {
              column[name].total += +count;
            }
          }
        });

        return {
          nodes: objectToArray(column).sort(firstBy('total', -1)),
        };
      });
  }, [data, selectedNode]);

  const handleClick = (item: string, index: number, paths: any[]) => {
    if (item !== selectedNode?.item || index !== selectedNode?.index) {
      setSelectedNode({ item, index, paths });
    } else {
      setSelectedNode(null);
    }
  };

  if (!data) {
    return null;
  }

  //console.log({ columns, selectedNode, activeNode });

  return (
    <div className={styles.container}>
      <div className={styles.view}>
        {columns.map((column, columnIndex) => {
          const current = columnIndex === selectedNode?.index;
          const behind = columnIndex <= selectedNode?.index - 1;
          const ahead = columnIndex > selectedNode?.index;

          return (
            <div
              key={columnIndex}
              className={classNames(styles.column, {
                [styles.current]: current,
                [styles.behind]: behind,
                [styles.ahead]: ahead,
              })}
            >
              <div className={styles.header}>
                <div className={styles.num}>{columnIndex + 1}</div>
              </div>
              <div className={styles.nodes}>
                {column.nodes.map(({ name, total, selected, paths, from, to }, nodeIndex) => {
                  const active =
                    selected && activeNode?.paths.find(path => path.items[columnIndex] === name);
                  const bars = [];
                  const lines = from?.reduce(
                    (obj: { flat: boolean; fromUp: boolean; fromDown: boolean }, { name }: any) => {
                      const fromIndex = columns[columnIndex - 1]?.nodes.findIndex(node => {
                        return node.name === name && node.selected;
                      });

                      if (fromIndex > -1) {
                        if (nodeIndex === fromIndex) {
                          obj.flat = true;
                        } else if (nodeIndex > fromIndex) {
                          obj.fromUp = true;
                          bars.push([fromIndex, nodeIndex, 1]);
                        } else if (nodeIndex < fromIndex) {
                          obj.fromDown = true;
                          bars.push([nodeIndex, fromIndex, 0]);
                        }
                      }

                      return obj;
                    },
                    {},
                  );

                  to?.reduce((obj: { toUp: boolean; toDown: boolean }, { name }: any) => {
                    const toIndex = columns[columnIndex + 1]?.nodes.findIndex(node => {
                      return node.name === name && node.selected;
                    });

                    if (toIndex > -1) {
                      if (nodeIndex > toIndex) {
                        obj.toUp = true;
                      } else if (nodeIndex < toIndex) {
                        obj.toDown = true;
                      }
                    }

                    return obj;
                  }, lines);

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
                      <div className={styles.count}>{total}</div>
                      {Object.keys(lines).map(key => {
                        return <div key={key} className={classNames(styles.line, styles[key])} />;
                      })}
                      {columnIndex < columns.length &&
                        bars.map(([a, b, d], i) => {
                          const height = (b - a - 1) * (NODE_HEIGHT + NODE_GAP) + NODE_GAP;
                          return (
                            <div
                              key={i}
                              className={styles.bar}
                              style={{
                                height: height + BAR_OFFSET,
                                top: d ? -height : NODE_HEIGHT,
                              }}
                            />
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
