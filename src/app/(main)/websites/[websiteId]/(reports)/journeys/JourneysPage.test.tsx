import type { ReactNode } from 'react';
import { beforeEach, expect, test, vi } from 'vitest';
import { render, screen } from '@/test/render';
import { JourneysPage } from './JourneysPage';

let mockDateRange = {
  startDate: new Date('2026-07-01T00:00:00.000Z'),
  endDate: new Date('2026-07-31T23:59:59.999Z'),
};

let mockValues = [{ value: '/signup' }, { value: 'Purchase' }];

beforeEach(() => {
  mockDateRange = {
    startDate: new Date('2026-07-01T00:00:00.000Z'),
    endDate: new Date('2026-07-31T23:59:59.999Z'),
  };
  mockValues = [{ value: '/signup' }, { value: 'Purchase' }];
});

vi.mock('@umami/react-zen', async importOriginal => {
  const actual = await importOriginal<typeof import('@umami/react-zen')>();

  return {
    ...actual,
    Column: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Grid: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Row: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    ListItem: ({ id, children }: { id: string | number; children: ReactNode }) => (
      <option value={id}>{children}</option>
    ),
    Select: ({
      label,
      value,
      defaultValue,
      onChange,
      children,
    }: {
      label: string;
      value?: string | number;
      defaultValue?: string | number;
      onChange?: (value: string) => void;
      children: ReactNode;
    }) => (
      <label>
        {label}
        <select
          aria-label={label}
          value={value ?? defaultValue ?? ''}
          onChange={event => onChange?.(event.currentTarget.value)}
        >
          {children}
        </select>
      </label>
    ),
  };
});

vi.mock('@/components/hooks', () => ({
  useDateRange: () => ({
    dateRange: mockDateRange,
  }),
  useMessages: () => ({
    t: (value: string) => value,
    labels: {
      all: 'All',
      views: 'Views',
      events: 'Events',
      steps: 'Steps',
      startStep: 'Start Step',
      endStep: 'End Step',
    },
  }),
}));

vi.mock('@/app/(main)/websites/[websiteId]/WebsiteControls', () => ({
  WebsiteControls: () => <div>WebsiteControls</div>,
}));

vi.mock('@/components/common/Panel', () => ({
  Panel: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/input/FilterButtons', () => ({
  FilterButtons: ({
    items,
    value,
    onChange,
  }: {
    items: { id: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
  }) => (
    <div>
      {items.map(item => (
        <button
          key={item.id}
          type="button"
          aria-pressed={value === item.id}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  ),
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
      <select aria-label={label} value={value} onChange={event => onChange(event.currentTarget.value)}>
        <option value="" />
        {value && !mockValues.some(item => item.value === value) && <option value={value}>{value}</option>}
        {mockValues.map(({ value }) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
    </label>
  ),
}));

vi.mock('./Journey', () => ({
  Journey: ({
    startDate,
    endDate,
    steps,
    startStep,
    endStep,
    view,
  }: {
    startDate: Date;
    endDate: Date;
    steps: number;
    startStep: string;
    endStep: string;
    view: string;
  }) => (
    <div data-test="journey-result">
      {JSON.stringify({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        steps,
        startStep,
        endStep,
        view,
      })}
    </div>
  ),
}));

test('keeps the selected journey params when the date range refreshes the value list', async () => {
  const { rerender, user } = render(<JourneysPage websiteId="website-1" />);

  await user.selectOptions(screen.getByLabelText('Steps'), '5');
  await user.selectOptions(screen.getByLabelText('Start Step'), '/signup');
  await user.selectOptions(screen.getByLabelText('End Step'), 'Purchase');
  await user.click(screen.getByRole('button', { name: 'Events' }));

  expect(screen.getByLabelText('Steps')).toHaveValue('5');
  expect(screen.getByLabelText('Start Step')).toHaveValue('/signup');
  expect(screen.getByLabelText('End Step')).toHaveValue('Purchase');
  expect(screen.getByRole('button', { name: 'Events' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByTestId('journey-result')).toHaveTextContent('"steps":5');
  expect(screen.getByTestId('journey-result')).toHaveTextContent('"startStep":"/signup"');
  expect(screen.getByTestId('journey-result')).toHaveTextContent('"endStep":"Purchase"');
  expect(screen.getByTestId('journey-result')).toHaveTextContent('"view":"events"');
  expect(screen.getByTestId('journey-result')).toHaveTextContent(
    '"startDate":"2026-07-01T00:00:00.000Z"',
  );

  mockDateRange = {
    startDate: new Date('2026-08-01T00:00:00.000Z'),
    endDate: new Date('2026-08-31T23:59:59.999Z'),
  };
  mockValues = [{ value: '/pricing' }];

  rerender(<JourneysPage websiteId="website-1" />);

  expect(screen.getByLabelText('Steps')).toHaveValue('5');
  expect(screen.getByLabelText('Start Step')).toHaveValue('/signup');
  expect(screen.getByLabelText('End Step')).toHaveValue('Purchase');
  expect(screen.getByRole('button', { name: 'Events' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByTestId('journey-result')).toHaveTextContent('"steps":5');
  expect(screen.getByTestId('journey-result')).toHaveTextContent('"startStep":"/signup"');
  expect(screen.getByTestId('journey-result')).toHaveTextContent('"endStep":"Purchase"');
  expect(screen.getByTestId('journey-result')).toHaveTextContent('"view":"events"');
  expect(screen.getByTestId('journey-result')).toHaveTextContent(
    '"startDate":"2026-08-01T00:00:00.000Z"',
  );
  expect(screen.getByTestId('journey-result')).toHaveTextContent(
    '"endDate":"2026-08-31T23:59:59.999Z"',
  );
});
