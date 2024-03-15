import { useContext } from 'react';
import { firstBy } from 'thenby';
import { ReportContext } from '../[reportId]/Report';
import { CHART_COLORS, UTM_PARAMS } from 'lib/constants';
import PieChart from 'components/charts/PieChart';
import ListTable from 'components/metrics/ListTable';
import styles from './UTMView.module.css';
import { useMessages } from 'components/hooks';

function toArray(data: { [key: string]: number }) {
  return Object.keys(data)
    .map(key => {
      return { name: key, value: data[key] };
    })
    .sort(firstBy('value', -1));
}

export default function UTMView() {
  const { formatMessage, labels } = useMessages();
  const { report } = useContext(ReportContext);
  const { data } = report || {};

  if (!data) {
    return null;
  }

  return (
    <div>
      {UTM_PARAMS.map(key => {
        const items = toArray(data[key]);
        const chartData = {
          labels: items.map(({ name }) => name),
          datasets: [
            {
              data: items.map(({ value }) => value),
              backgroundColor: CHART_COLORS,
            },
          ],
        };
        const total = items.reduce((sum, { value }) => {
          return +sum + +value;
        }, 0);

        return (
          <div key={key} className={styles.row}>
            <div>
              <div className={styles.title}>{key}</div>
              <ListTable
                metric={formatMessage(labels.views)}
                data={items.map(({ name, value }) => ({
                  x: name,
                  y: value,
                  z: (value / total) * 100,
                }))}
              />
            </div>
            <div>
              <PieChart type="doughnut" data={chartData} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
