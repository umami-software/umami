import * as React from 'react';
import type { SVGProps } from 'react';
const SvgExport = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={512} height={512} viewBox="0 0 24 24" {...props}>
    <switch>
      <g>
        <path d="M8.7 7.7 11 5.4V15c0 .6.4 1 1 1s1-.4 1-1V5.4l2.3 2.3c.4.4 1 .4 1.4 0s.4-1 0-1.4l-4-4c-.1-.1-.2-.2-.3-.2-.2-.1-.5-.1-.8 0-.1 0-.2.1-.3.2l-4 4c-.4.4-.4 1 0 1.4s1 .4 1.4 0M21 14c-.6 0-1 .4-1 1v4c0 .6-.4 1-1 1H5c-.6 0-1-.4-1-1v-4c0-.6-.4-1-1-1s-1 .4-1 1v4c0 1.7 1.3 3 3 3h14c1.7 0 3-1.3 3-3v-4c0-.6-.4-1-1-1" />
      </g>
    </switch>
  </svg>
);
export default SvgExport;
