import { render, screen } from '@testing-library/react';
import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';
import { expect, test, vi } from 'vitest';
import { MetricsExpandedTable } from './MetricsExpandedTable';

vi.mock('@umami/react-zen', () => ({
  Button: ({ children }: { children: ReactNode }) => <button type="button">{children}</button>,
  Column: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DataColumn: () => null,
  DataTable: ({ data, children }: { data: any[]; children: ReactNode }) => (
    <table>
      <tbody>
        {data.map(row => (
          <tr key={row.label}>
            {Children.toArray(children)
              .flat()
              .filter(isValidElement)
              .map(column => {
                const { id, children: render } = (column as ReactElement<any>).props;
                return <td key={id}>{render(row)}</td>;
              })}
          </tr>
        ))}
      </tbody>
    </table>
  ),
  Icon: ({ children }: { children: ReactNode }) => <span>{children}</span>,
  Row: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SearchField: () => null,
}));

vi.mock('@/components/common/LoadingPanel', () => ({
  LoadingPanel: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/common/OverlayScrollArea', () => ({
  OverlayScrollArea: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/common/Pager', () => ({
  Pager: () => null,
}));

vi.mock('@/components/input/DownloadButton', () => ({
  DownloadButton: () => null,
}));

vi.mock('@/components/metrics/MetricLabel', () => ({
  MetricLabel: ({ data }: { data: { label: string } }) => <span>{data.label}</span>,
}));

vi.mock('@/components/hooks', () => ({
  useMessages: () => ({ t: (value: string) => value, labels: {} }),
  useWebsiteExpandedMetricsQuery: () => ({
    // PostgreSQL returns sum() as numeric, which arrives as a string.
    data: [{ name: 'Windows', visitors: 9791, visits: 81284, pageviews: '829042' }],
    isLoading: false,
    isFetching: false,
  }),
}));

test('formats views like visits when the API returns them as a string', () => {
  render(<MetricsExpandedTable websiteId="website-1" type="path" />);

  expect(screen.getByText((81284).toLocaleString())).toBeInTheDocument();
  expect(screen.getByText((829042).toLocaleString())).toBeInTheDocument();
});
