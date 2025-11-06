import * as React from 'react';
import type { SVGProps } from 'react';
const SvgDashboard = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    className="dashboard_svg__lucide dashboard_svg__lucide-layout-dashboard"
    viewBox="0 0 24 24"
    {...props}
  >
    <rect width={7} height={9} x={3} y={3} rx={1} />
    <rect width={7} height={5} x={14} y={3} rx={1} />
    <rect width={7} height={9} x={14} y={12} rx={1} />
    <rect width={7} height={5} x={3} y={16} rx={1} />
  </svg>
);
export default SvgDashboard;
