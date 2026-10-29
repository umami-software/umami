import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { beforeEach, expect, test, vi } from 'vitest';
import { LookupField } from './LookupField';

const queryMock = vi.fn();

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
  }) => {
    const handleBlur = () => {
      // In Base UI / ComboBox, uncontrolled value causes inputValue to reset to empty on blur/close
      if (value === undefined || value === null) {
        onInputValueChange?.('');
      }
    };

    return (
      <div>
        <input
          aria-label={ariaLabel}
          data-value={value}
          value={inputValue ?? value ?? ''}
          onChange={event => onInputValueChange?.(event.currentTarget.value)}
          onBlur={handleBlur}
        />
        {items.map(item => (
          <button key={item} type="button" onClick={() => onChange?.(item)}>
            {item}
          </button>
        ))}
      </div>
    );
  },
}));

vi.mock('@/components/hooks', () => ({
  useMessages: () => ({
    t: (value: string) => value,
    messages: { noResultsFound: 'No results found' },
  }),
  useWebsiteValuesQuery: (params: unknown) => {
    queryMock(params);
    return {
      data: [{ value: '/home' }, { value: '/pricing' }],
      isLoading: false,
    };
  },
}));

function TestLookupField({
  initialValue = '',
  allowCustomValue = true,
  onValueChange,
}: {
  initialValue?: string;
  allowCustomValue?: boolean;
  onValueChange?: (value: string) => void;
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <LookupField
      websiteId="website-1"
      type="path"
      value={value}
      allowCustomValue={allowCustomValue}
      onChange={setValue}
      onValueChange={onValueChange}
    />
  );
}

beforeEach(() => {
  queryMock.mockClear();
});

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

test('retains custom wildcard path after blur when allowCustomValue is true', () => {
  render(<TestLookupField />);

  const input = screen.getByLabelText('LookupField');
  fireEvent.change(input, { target: { value: '*/page/detail/*' } });
  fireEvent.blur(input);

  expect(input).toHaveValue('*/page/detail/*');
  expect(input).toHaveAttribute('data-value', '*/page/detail/*');
});

test('updates value, search query, and triggers onValueChange when selecting an item', () => {
  const onValueChange = vi.fn();
  render(<TestLookupField onValueChange={onValueChange} />);

  const input = screen.getByLabelText('LookupField');
  const option = screen.getByRole('button', { name: '/pricing' });
  fireEvent.click(option);

  expect(input).toHaveValue('/pricing');
  expect(input).toHaveAttribute('data-value', '/pricing');
  expect(onValueChange).toHaveBeenCalledWith('/pricing');
  expect(queryMock).toHaveBeenCalledWith(
    expect.objectContaining({
      search: '/pricing',
      websiteId: 'website-1',
      type: 'path',
    }),
  );
});
