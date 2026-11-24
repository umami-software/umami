import type { ReactNode } from 'react';
import { beforeEach, expect, test, vi } from 'vitest';
import { render, screen } from '@/test/render';
import { AttributionPage } from './AttributionPage';

let mockDateRange = {
  startDate: new Date('2026-07-01T00:00:00.000Z'),
  endDate: new Date('2026-07-31T23:59:59.999Z'),
};

let mockValues = [{ value: 'Sign up' }, { value: 'Purchase' }];

beforeEach(() => {
  mockDateRange = {
    startDate: new Date('2026-07-01T00:00:00.000Z'),
    endDate: new Date('2026-07-31T23:59:59.999Z'),
  };
  mockValues = [{ value: 'Sign up' }, { value: 'Purchase' }];
});

vi.mock('@umami/react-zen', async importOriginal => {
  const actual = await importOriginal<typeof import('@umami/react-zen')>();

  return {
    ...actual,
    Column: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Grid: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Field: ({ children }: { children: ReactNode }) => <label>{children}</label>,
    FieldLabel: ({ children }: { children: ReactNode }) => <>{children}</>,
    Select: ({
      value,
      onValueChange,
      children,
    }: {
      value?: string | number;
      onValueChange?: (value: string) => void;
      children: ReactNode;
    }) => (
      <select value={value ?? ''} onChange={event => onValueChange?.(event.currentTarget.value)}>
        {children}
      </select>
    ),
    SelectTrigger: () => null,
    SelectValue: () => null,
    SelectContent: ({ children }: { children: ReactNode }) => <>{children}</>,
    SelectItem: ({ value, children }: { value: string | number; children: ReactNode }) => (
      <option value={value}>{children}</option>
    ),
  };
});

vi.mock('@/components/common/Empty', () => ({
  Empty: () => <div>Empty</div>,
}));

vi.mock('@/components/hooks', () => ({
  useDateRange: () => ({
    dateRange: mockDateRange,
  }),
  useTimezone: () => ({ timezone: 'UTC', toUtc: (date: Date) => date }),
  useMessages: () => ({
    t: (value: string) => value,
    labels: {
      model: 'Model',
      type: 'Type',
      conversionStep: 'Conversion Step',
      firstClick: 'First Click',
      lastClick: 'Last Click',
      viewedPage: 'Viewed Page',
      triggeredEvent: 'Triggered Event',
    },
    messages: {
      noResultsFound: 'No results found',
    },
  }),
  useWebsiteValuesQuery: () => ({
    data: mockValues,
    isLoading: false,
  }),
}));

vi.mock('@/components/input/WebsiteValueComboBox', () => ({
  WebsiteValueComboBox: ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
  }) => (
    <label>
      {label}
      <select
        aria-label={label}
        value={value}
        onChange={event => onChange(event.currentTarget.value)}
      >
        <option value="" />
        {value && !mockValues.some(item => item.value === value) && (
          <option value={value}>{value}</option>
        )}
        {mockValues.map(({ value }) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
    </label>
  ),
}));

vi.mock('@/app/(main)/websites/[websiteId]/WebsiteControls', () => ({
  WebsiteControls: () => <div>WebsiteControls</div>,
}));

vi.mock('./Attribution', () => ({
  Attribution: ({ step, type }: { step: string; type: string }) => (
    <div data-test="attribution-result">{`${type}:${step}`}</div>
  ),
}));

test('keeps the selected conversion step when the date range refreshes the value list', async () => {
  const { rerender, user } = render(<AttributionPage websiteId="website-1" />);

  await user.selectOptions(screen.getByLabelText('Conversion Step'), 'Purchase');

  expect(screen.getByLabelText('Conversion Step')).toHaveValue('Purchase');
  expect(screen.getByTestId('attribution-result')).toHaveTextContent('path:Purchase');

  mockDateRange = {
    startDate: new Date('2026-08-01T00:00:00.000Z'),
    endDate: new Date('2026-08-31T23:59:59.999Z'),
  };
  mockValues = [{ value: 'Sign up' }];

  rerender(<AttributionPage websiteId="website-1" />);

  expect(screen.getByLabelText('Conversion Step')).toHaveValue('Purchase');
  expect(screen.getByTestId('attribution-result')).toHaveTextContent('path:Purchase');
});

test('clears the selected conversion step when the attribution type changes', async () => {
  const { user } = render(<AttributionPage websiteId="website-1" />);

  await user.selectOptions(screen.getByLabelText('Conversion Step'), 'Purchase');

  expect(screen.getByTestId('attribution-result')).toHaveTextContent('path:Purchase');

  await user.selectOptions(screen.getByLabelText('Type'), 'event');

  expect(screen.getByLabelText('Conversion Step')).toHaveValue('');
  expect(screen.queryByTestId('attribution-result')).not.toBeInTheDocument();
});
