import * as React from 'react';
import type { SVGProps } from 'react';
const SvgBookmark = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={512} height={512} viewBox="0 0 24 24" {...props}>
    <path d="M3.515 22.875a1 1 0 0 0 1.015-.027L12 18.179l7.47 4.669A1 1 0 0 0 21 22V4a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v18a1 1 0 0 0 .515.875M5 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v16.2l-6.47-4.044a1 1 0 0 0-1.06 0L5 20.2z" />
  </svg>
);
export default SvgBookmark;
