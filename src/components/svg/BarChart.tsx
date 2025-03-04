import * as React from 'react';
import type { SVGProps } from 'react';
const SvgBarChart = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={512} height={512} viewBox="0 0 24 24" {...props}>
    <path d="M7 13v9a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1m7-12h-4a1 1 0 0 0-1 1v20a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1m8 5h-4a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1" />
  </svg>
);
export default SvgBarChart;
