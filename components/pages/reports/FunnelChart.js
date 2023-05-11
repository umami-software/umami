import FunnelGraph from 'funnel-graph-js/dist/js/funnel-graph';
import { useEffect, useRef } from 'react';

export default function FunnelChart() {
  const funnel = useRef(null);

  useEffect(() => {
    funnel.current.innerHTML = '';

    const data = {
      labels: ['Cv Sent', '1st  Interview', '2nd Interview', '3rd Interview', 'Offer'],
      subLabels: ['Cv Sent', '1st  Interview', '2nd Interview', '3rd Interview', 'Offer'],
      colors: [
        ['#FFB178', '#FF78B1', '#FF3C8E'],
        ['#FFB178', '#FF78B1', '#FF3C8E'],
        ['#A0BBFF', '#EC77FF'],
        ['#A0F9FF', '#7795FF'],
        ['#FFB178', '#FF78B1', '#FF3C8E'],
      ],
      values: [[3500], [3300], [2000], [600], [330]],
    };

    const graph = new FunnelGraph({
      container: '.funnel',
      gradientDirection: 'horizontal',
      data: data,
      displayPercent: true,
      direction: 'Vertical',
      width: 1000,
      height: 350,
      subLabelValue: 'values',
    });

    graph.draw();
  }, []);

  return (
    <div>
      FunnelChart
      <div className="funnel" ref={funnel} />
    </div>
  );
}
