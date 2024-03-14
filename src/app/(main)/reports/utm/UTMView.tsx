import { useContext } from 'react';
import { firstBy } from 'thenby';
import { ReportContext } from '../[reportId]/Report';
import styles from './UTMView.module.css';

function toArray(data: { [key: string]: number }) {
  return Object.keys(data)
    .map(key => {
      return { name: key, value: data[key] };
    })
    .sort(firstBy('value', -1));
}

export default function UTMView() {
  const { report } = useContext(ReportContext);
  const { data } = report || {};

  if (!data) {
    return null;
  }

  return (
    <div>
      {Object.keys(data).map(key => {
        return (
          <div key={key}>
            <div className={styles.title}>{key}</div>
            <div className={styles.params}>
              {toArray(data[key]).map(({ name, value }) => {
                return (
                  <div key={name} className={styles.row}>
                    <div className={styles.label}>{name}</div>
                    <div className={styles.value}>{value}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
