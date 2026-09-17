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
    inputValue,
    onInputValueChange,
    items,
  }: {
    'aria-label'?: string;
    inputValue: string;
    onInputValueChange: (value: string) => void;
    items: string[];
  }) => (
    <div>
      <input
        aria-label={ariaLabel}
        value={inputValue}
        onChange={event => onInputValueChange(event.currentTarget.value)}
      />
      {items.map(item => (
        <div key={item}>{item}</div>
      ))}
    </div>
  ),
}));

vi.mock('@/components/hooks', () => ({
  useMessages: () => ({
    t: (value: string) => value,
    messages: { noResultsFound: 'No results found' },
  }),
  useWebsiteValuesQuery: () => ({ data: [], isLoading: false }),
}));

function TestLookupField() {
  const [value, setValue] = useState('');

  return (
    <LookupField
      websiteId="website-1"
      type="path"
      value={value}
      allowCustomValue
      onChange={setValue}
    />
  );
}

test('offers a manually entered funnel value as a selectable option', () => {
  render(<TestLookupField />);

  fireEvent.change(screen.getByLabelText('LookupField'), { target: { value: '/blog/*' } });

  expect(screen.getByText('/blog/*')).toBeInTheDocument();
});
