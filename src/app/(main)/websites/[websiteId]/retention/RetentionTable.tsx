import { EmptyPlaceholder } from '@/components/common/EmptyPlaceholder';
import { useMessages, useLocale, useReport } from '@/components/hooks';
import { formatDate } from '@/lib/date';

const DAYS = [1, 2, 3, 4, 5, 6, 7, 14, 21, 28];

export function RetentionTable({ days = DAYS }) {
  const { formatMessage, labels } = useMessages();
  const { locale } = useLocale();
  const { report } = useReport();
  const { data } = report || {};

  if (!data) {
    return <EmptyPlaceholder />;
  }

  const rows = data.reduce((arr: any[], row: { date: any; visitors: any; day: any }) => {
    const { date, visitors, day } = row;
    if (day === 0) {
      return arr.concat({
        date,
        visitors,
        records: days
          .reduce((arr, day) => {
            arr[day] = data.find(x => x.date === date && x.day === day);
            return arr;
          }, [])
          .filter(n => n),
      });
    }
    return arr;
  }, []);

  const totalDays = rows.length;

  return (
    <>
      <div>
        <div>
          <div>{formatMessage(labels.date)}</div>
          <div>{formatMessage(labels.visitors)}</div>
          {days.map(n => (
            <div key={n}>
              {formatMessage(labels.day)} {n}
            </div>
          ))}
        </div>
        {rows.map(({ date, visitors, records }, rowIndex) => {
          return (
            <div key={rowIndex}>
              <div>{formatDate(date, 'PP', locale)}</div>
              <div>{visitors}</div>
              {days.map(day => {
                if (totalDays - rowIndex < day) {
                  return null;
                }
                const percentage = records.filter(a => a.day === day)[0]?.percentage;
                return <div key={day}>{percentage ? `${Number(percentage).toFixed(2)}%` : ''}</div>;
              })}
            </div>
          );
        })}
      </div>
    </>
  );
}
