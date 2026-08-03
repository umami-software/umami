import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { expect, test, vi } from 'vitest';
import { WebsiteValueComboBox } from './WebsiteValueComboBox';

vi.mock('@umami/react-zen', () => ({
  cn: (...values: string[]) => values.filter(Boolean).join(' '),
  Label: ({ children }: { children: ReactNode }) => <label>{children}</label>,
  ListItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Loading: () => <div>Loading</div>,
  useDebounce: (value: string) => value,
}));

vi.mock('@/components/common/ComboBox', () => ({
  ComboBox: ({
    'aria-label': ariaLabel,
    inputValue,
    onInputValueChange,
    children,
  }: {
    'aria-label'?: string;
    inputValue: string;
    onInputValueChange: (value: string) => void;
    children: ReactNode;
  }) => (
    <div>
      <input
        aria-label={ariaLabel}
        value={inputValue}
        onChange={event => onInputValueChange(event.currentTarget.value)}
      />
      {children}
    </div>
  ),
}));

vi.mock('@/components/hooks', () => ({
  useMessages: () => ({
    t: (value: string) => value,
    messages: { noResultsFound: 'No results found' },
  }),
  useWebsiteValuesQuery: ({ type }: { type: string }) => ({
    data: type === 'path' ? [{ value: '/home' }] : type === 'event' ? [{ value: 'signup' }] : [],
    isLoading: false,
  }),
}));

test('clears the selected website value when the input is cleared', () => {
  const onChange = vi.fn();

  render(
    <WebsiteValueComboBox
      label="Start step"
      websiteId="website-1"
      type="path"
      startDate={new Date('2026-08-01')}
      endDate={new Date('2026-08-03')}
      value="/home"
      onChange={onChange}
    />,
  );

  fireEvent.change(screen.getByLabelText('Start step'), { target: { value: '' } });

  expect(onChange).toHaveBeenCalledWith('');
});

test('combines values from both Journey step types', () => {
  render(
    <WebsiteValueComboBox
      label="Start step"
      websiteId="website-1"
      type="path"
      additionalType="event"
      startDate={new Date('2026-08-01')}
      endDate={new Date('2026-08-03')}
      value=""
      onChange={() => {}}
    />,
  );

  expect(screen.getByText('/home')).toBeInTheDocument();
  expect(screen.getByText('signup')).toBeInTheDocument();
});
