import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

vi.mock('@/components/hooks', () => ({
  useConfig: () => ({}),
  useCountryNames: () => ({ countryNames: {} }),
  useFormat: () => ({
    formatValue: (value: string, type: string) => {
      if (value === 'browser') {
        return 'Unknown';
      }
      if (type === 'device' && value === 'smarttv') {
        return 'Smart TV';
      }
      return value || '';
    },
  }),
  useLocale: () => ({ locale: 'en-US' }),
  useMessages: () => ({
    t: (value: string) => value,
    labels: { direct: 'Direct', unknown: 'Unknown' },
  }),
  useNavigation: () => ({ query: {}, updateParams: () => '/' }),
  useRegionNames: () => ({ getRegionName: (value: string) => value }),
}));

import { MetricLabel } from './MetricLabel';

describe('MetricLabel', () => {
  test('uses an unknown label and a neutral icon for missing icon-based dimensions', () => {
    const { container } = render(<MetricLabel type="country" data={{ label: '' }} />);

    expect(screen.getByText('(Unknown)')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  // Real device types must stay identifiable and filterable rather than shown as unknown
  test('shows non-core device types by name with a filter link', () => {
    render(<MetricLabel type="device" data={{ label: 'smarttv' }} />);

    expect(screen.getByText('Smart TV')).toBeInTheDocument();
    expect(screen.queryByText('(Unknown)')).not.toBeInTheDocument();
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  test('uses the fallback icon for browser values displayed as unknown', () => {
    const { container } = render(<MetricLabel type="browser" data={{ label: 'browser' }} />);

    expect(screen.getByText('(Unknown)')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  test('identifies a missing referrer as direct traffic', () => {
    const { container } = render(<MetricLabel type="referrer" data={{ label: '' }} />);

    expect(screen.getByText('Direct')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  test('uses the unknown label without an icon for missing paths', () => {
    const { container } = render(<MetricLabel type="path" data={{ label: '' }} />);

    expect(screen.getByText('(Unknown)')).toBeInTheDocument();
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });
});
