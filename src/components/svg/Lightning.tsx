import * as React from 'react';
import type { SVGProps } from 'react';
const SvgLightning = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    viewBox="0 0 682.667 682.667"
    {...props}
  >
    <defs>
      <clipPath id="lightning_svg__a" clipPathUnits="userSpaceOnUse">
        <path d="M0 512h512V0H0Z" />
      </clipPath>
    </defs>
    <g clipPath="url(#lightning_svg__a)" transform="matrix(1.33333 0 0 -1.33333 0 682.667)">
      <path
        d="M0 0h137.962L69.319-155.807h140.419L.242-482l55.349 222.794h-155.853z"
        style={{
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 30,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeMiterlimit: 10,
          strokeDasharray: 'none',
          strokeOpacity: 1,
        }}
        transform="translate(201.262 496.994)"
      />
    </g>
  </svg>
);
export default SvgLightning;
