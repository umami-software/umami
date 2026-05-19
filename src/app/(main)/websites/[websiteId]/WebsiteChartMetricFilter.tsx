import { ListItem, Row, Select } from '@umami/react-zen';
import { useMessages, useNavigation } from '@/components/hooks';
import type { WebsiteChartMetric } from './WebsiteChart';
import { DEFAULT_WEBSITE_CHART_METRIC } from './WebsiteChart';

export function WebsiteChartMetricFilter() {
  const { t, labels } = useMessages();
  const { router, query, updateParams } = useNavigation();

  const options: { id: WebsiteChartMetric; label: string }[] = [
    { id: 'pageviews', label: `${t(labels.visitors)} / ${t(labels.views)}` },
    { id: 'bouncerate', label: t(labels.bounceRate) },
    { id: 'visitduration', label: t(labels.visitDuration) },
  ];

  const selected = (query.metric as WebsiteChartMetric) ?? DEFAULT_WEBSITE_CHART_METRIC;

  const handleChange = (value: string) => {
    router.push(updateParams({ metric: value }));
  };

  return (
    <Row>
      <Select
        value={selected}
        onChange={handleChange}
        popoverProps={{ placement: 'bottom right' }}
        style={{ width: 180 }}
      >
        {options.map(({ id, label }) => (
          <ListItem key={id} id={id}>
            {label}
          </ListItem>
        ))}
      </Select>
    </Row>
  );
}
