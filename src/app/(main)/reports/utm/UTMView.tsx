import { useContext } from 'react';
import { firstBy } from 'thenby';
import { ReportContext } from '../[reportId]/Report';
import { CHART_COLORS, UTM_PARAMS } from '@/lib/constants';
import PieChart from '@/components/charts/PieChart';
import ListTable from '@/components/metrics/ListTable';
import styles from './UTMView.module.css';
import { useMessages } from '@/components/hooks';

function toArray(data: { [key: string]: number } = {}) {
  return Object.keys(data)
    .map(key => {
      return { name: key, value: data[key] };
    })
    .sort(firstBy('value', -1));
}

function parseParameters(data: any[]) {
  return data.reduce((obj, { url_query, num }) => {
    try {
      const searchParams = new URLSearchParams(url_query);

      for (const [key, value] of searchParams) {
        if (key.match(/^utm_(\w+)$/)) {
          const name = value;
          if (!obj[key]) {
            obj[key] = { [name]: Number(num) };
          } else if (!obj[key][name]) {
            obj[key][name] = Number(num);
          } else {
            obj[key][name] += Number(num);
          }
        }
      }
    } catch {
      // Ignore
    }

    return obj;
  }, {});
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
      {UTM_PARAMS.map(param => {
        const items = toArray(parseParameters(data)[param]);
        const chartData = {
          labels: items.map(({ name }) => name),
          datasets: [
            {
              data: items.map(({ value }) => value),
              backgroundColor: CHART_COLORS,
              borderWidth: 0,
            },
          ],
        };
        const total = items.reduce((sum, { value }) => {
          return +sum + +value;
        }, 0);

        return (
          <div key={param} className={styles.row}>
            <div>
              <div className={styles.title}>{param.replace(/^utm_/, '')}</div>
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
