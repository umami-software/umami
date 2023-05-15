import FunnelGraph from 'funnel-graph-js/dist/js/funnel-graph';
import { useEffect, useRef } from 'react';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import useMessages from 'hooks/useMessages';

export default function FunnelChart({ data }) {
  const { formatMessage, labels, messages } = useMessages();
  const funnel = useRef(null);

  useEffect(() => {
    if (data && data.length > 0) {
      funnel.current.innerHTML = '';

      const chartData = {
        labels: data.map(a => a.url),
        colors: ['#147af3', '#e0f2ff'],
        values: data.map(a => a.count),
      };

      const graph = new FunnelGraph({
        container: '.funnel',
        gradientDirection: 'horizontal',
        data: chartData,
        displayPercent: true,
        direction: 'Vertical',
        width: 1000,
        height: 350,
      });

      graph.draw();
    }
  }, [data]);

  return (
    <>
      {data?.length > 0 && <div className="funnel" ref={funnel} />}
      {data?.length === 0 && <EmptyPlaceholder message={formatMessage(messages.noResultsFound)} />}
    </>
  );
}
