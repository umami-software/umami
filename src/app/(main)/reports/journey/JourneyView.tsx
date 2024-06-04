import { useContext, useMemo, useState } from 'react';
import { ReportContext } from '../[reportId]/Report';
import { firstBy } from 'thenby';
import styles from './JourneyView.module.css';
import classNames from 'classnames';
import { useEscapeKey } from 'components/hooks';

export default function JourneyView() {
  const [selected, setSelected] = useState(null);
  const { report } = useContext(ReportContext);
  const { data, parameters } = report || {};
  useEscapeKey(() => setSelected(null));
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
  }, [data]);

  const handleClick = (item: string, index: number, paths: any[]) => {
    if (item !== selected?.item || index !== selected?.index) {
      setSelected({ item, index, paths });
    } else {
      setSelected(null);
    }
  };

  if (!data) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.view}>
        {columns.map((column, index) => {
          const current = index === selected?.index;
          const behind = index <= selected?.index - 1;
          const ahead = index > selected?.index;

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
              {column.map(({ item, total, paths }) => {
                const highlight = selected?.paths.find(arr => {
                  return arr.find(a => a.items[index] === item);
                });

                return (
                  <div
                    key={item}
                    className={classNames(styles.item, {
                      [styles.highlight]: highlight,
                    })}
                    onClick={() => handleClick(item, index, paths)}
                  >
                    {item} ({total})
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
