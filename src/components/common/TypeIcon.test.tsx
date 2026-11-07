import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fireEvent, render } from '@testing-library/react';
import { expect, test } from 'vitest';
import { TypeIcon } from './TypeIcon';

test('renders the shared unknown icon for known unknown values', () => {
  const { container, queryByRole } = render(<TypeIcon type="browser" value="browser" />);

  expect(queryByRole('img')).not.toBeInTheDocument();
  expect(container.querySelector('svg')).toBeInTheDocument();
});

test('maps names with dots and slashes to their existing image files', () => {
  // Image files use dashes, e.g. windows-8-1.png and os-2.png
  const { getByRole, rerender } = render(<TypeIcon type="os" value="Windows 8.1" />);

  expect(getByRole('img')).toHaveAttribute('src', '/images/os/windows-8-1.png');

  rerender(<TypeIcon type="os" value="OS/2" />);

  expect(getByRole('img')).toHaveAttribute('src', '/images/os/os-2.png');
});

// A real value without a logo is still known data, so it must not look like Unknown
test('renders a blank placeholder, not the unknown icon, when a type image is unavailable', () => {
  const { container, getByRole } = render(<TypeIcon type="os" value="Windows CE" />);

  fireEvent.error(getByRole('img'));

  expect(getByRole('img')).toHaveAttribute('src', '/images/os/unknown.png');
  expect(container.querySelector('svg')).not.toBeInTheDocument();
});

// A known row (e.g. a city) whose icon value is missing is still known data: blank, not "?"
test('renders the blank placeholder directly when a known row has no icon value', () => {
  const { container } = render(<TypeIcon type="country" value="" unknown={false} />);

  expect(container.querySelector('img')).toHaveAttribute('src', '/images/country/unknown.png');
  expect(container.querySelector('svg')).not.toBeInTheDocument();
});

test('renders the unknown icon when the caller marks the row unknown', () => {
  const { container, queryByRole } = render(<TypeIcon type="country" value="US" unknown={true} />);

  expect(queryByRole('img')).not.toBeInTheDocument();
  expect(container.querySelector('svg')).toBeInTheDocument();
});

// Every device type UAParser can produce has its own icon, so none fall back to the unknown icon
test.each([
  'desktop',
  'laptop',
  'mobile',
  'tablet',
  'smarttv',
  'console',
  'wearable',
  'xr',
  'embedded',
])('renders a dedicated device image for %s', value => {
  const { getByRole } = render(<TypeIcon type="device" value={value} />);

  expect(getByRole('img')).toHaveAttribute('src', `/images/device/${value}.png`);
  expect(existsSync(join(process.cwd(), 'public', 'images', 'device', `${value}.png`))).toBe(true);
});
