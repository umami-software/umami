import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { expect, test, vi } from 'vitest';
import { LookupField } from './LookupField';

vi.mock('@umami/react-zen', () => ({
  ListItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Loading: () => <div>Loading</div>,
  useDebounce: (value: string) => value,
}));

vi.mock('@/components/common/ComboBox', () => ({
  ComboBox: ({
    'aria-label': ariaLabel,
    value,
    inputValue,
    onChange,
    onInputValueChange,
    items,
  }: {
    'aria-label'?: string;
    value?: string;
    inputValue?: string;
    onChange?: (value: string) => void;
    onInputValueChange?: (value: string) => void;
    items: string[];
  }) => (
    <div>
      <input
        aria-label={ariaLabel}
        data-value={value}
        value={inputValue ?? value ?? ''}
        onChange={event => onInputValueChange?.(event.currentTarget.value)}
      />
      {items.map(item => (
        <button key={item} type="button" onClick={() => onChange?.(item)}>
          {item}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('@/components/hooks', () => ({
  useMessages: () => ({
    t: (value: string) => value,
    messages: { noResultsFound: 'No results found' },
  }),
  useWebsiteValuesQuery: () => ({
    data: [{ value: '/home' }, { value: '/pricing' }],
    isLoading: false,
  }),
}));

function TestLookupField({ initialValue = '', allowCustomValue = true }: { initialValue?: string; allowCustomValue?: boolean }) {
  const [value, setValue] = useState(initialValue);

  return (
    <LookupField
      websiteId="website-1"
      type="path"
      value={value}
      allowCustomValue={allowCustomValue}
      onChange={setValue}
    />
  );
}

test('offers a manually entered funnel value as a selectable option', () => {
  render(<TestLookupField />);

  fireEvent.change(screen.getByLabelText('LookupField'), { target: { value: '/blog/*' } });

  expect(screen.getByText('/blog/*')).toBeInTheDocument();
});

test('controls ComboBox value and retains wildcard paths when allowCustomValue is true', () => {
  render(<TestLookupField />);

  const input = screen.getByLabelText('LookupField');
  fireEvent.change(input, { target: { value: '*/page/detail/*' } });

  expect(input).toHaveValue('*/page/detail/*');
  expect(input).toHaveAttribute('data-value', '*/page/detail/*');
  expect(screen.getByRole('button', { name: '*/page/detail/*' })).toBeInTheDocument();
});

test('updates value and search when selecting an item from the ComboBox dropdown', () => {
  render(<TestLookupField />);

  const input = screen.getByLabelText('LookupField');
  const option = screen.getByRole('button', { name: '/pricing' });
  fireEvent.click(option);

  expect(input).toHaveValue('/pricing');
  expect(input).toHaveAttribute('data-value', '/pricing');
});
