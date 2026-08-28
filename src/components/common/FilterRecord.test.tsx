import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { expect, test, vi } from 'vitest';
import { FilterRecord } from './FilterRecord';

vi.mock('@umami/react-zen', () => ({
  Button: ({ children }: { children: ReactNode }) => <button>{children}</button>,
  Column: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Grid: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Icon: ({ children }: { children: ReactNode }) => <span>{children}</span>,
  Label: ({ children }: { children: ReactNode }) => <label>{children}</label>,
  ListItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Loading: () => <div>Loading</div>,
  Select: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TextField: ({ value }: { value: string }) => (
    <input aria-label="Filter value" value={value} readOnly />
  ),
}));

vi.mock('@/components/common/Empty', () => ({ Empty: () => <div>Empty</div> }));
vi.mock('@/components/common/MultiSelect', () => ({
  MultiSelect: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  MultiSelectItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/components/hooks', () => ({
  useFilters: () => ({ fields: [], operators: [] }),
  useFormat: () => ({ formatValue: (value: string) => value }),
  useWebsiteValuesQuery: () => ({ data: [], isLoading: false }),
}));
vi.mock('@/components/icons', () => ({ X: () => null }));

test('keeps commas in regex filter values', () => {
  const value = '^[a-zA-Z0-9]{21,22}$';

  render(
    <FilterRecord
      type="path"
      startDate={new Date('2026-08-01')}
      endDate={new Date('2026-08-02')}
      name="path"
      operator="re"
      value={value}
    />,
  );

  expect(screen.getByLabelText('Filter value')).toHaveValue(value);
});
