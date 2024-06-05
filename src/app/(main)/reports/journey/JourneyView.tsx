import { useContext, useMemo, useState } from 'react';
import { ReportContext } from '../[reportId]/Report';
import { firstBy } from 'thenby';
import classNames from 'classnames';
import { useEscapeKey } from 'components/hooks';
import styles from './JourneyView.module.css';

export default function JourneyView() {
  const [selectedNode, setSelectedNode] = useState(null);
  const { report } = useContext(ReportContext);
  const { data, parameters } = report || {};

  useEscapeKey(() => setSelectedNode(null));

  const columns = useMemo(() => {
    if (!data) {
      return [];
    }
    return Array(Number(parameters.steps))
      .fill(undefined)
      .map((col = {}, index) => {
        data.forEach(({ items, count }) => {
          const item = items[index];

          if (item) {
            if (!col[item]) {
              col[item] = {
                item,
                total: +count,
                index,
                selected: !!selectedNode?.paths.find(arr => {
                  return arr.find(a => a.items[index] === item);
                }),
                paths: [
                  data.filter((d, i) => {
                    return d.items[index] === item && i !== index;
                  }),
                ],
              };
            } else {
              col[item].total += +count;
            }
          }
        });

        return Object.keys(col)
          .map(key => col[key])
          .sort(firstBy('total', -1));
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

  return (
    <div className={styles.container}>
      <div className={styles.view}>
        {columns.map((nodes, index) => {
          const current = index === selectedNode?.index;
          const behind = index <= selectedNode?.index - 1;
          const ahead = index > selectedNode?.index;

          return (
            <div
              key={index}
              className={classNames(styles.column, {
                [styles.current]: current,
                [styles.behind]: behind,
                [styles.ahead]: ahead,
              })}
            >
              <div className={styles.header}>
                <div className={styles.num}>{index + 1}</div>
              </div>
              <div className={styles.nodes}>
                {nodes.map(({ item, total, selected, paths }, i) => {
                  return (
                    <div
                      id={`node_${index}_${i}`}
                      key={item}
                      className={classNames(styles.item, {
                        [styles.selected]: selected,
                      })}
                      onClick={() => handleClick(item, index, paths)}
                    >
                      {item} ({total})
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
