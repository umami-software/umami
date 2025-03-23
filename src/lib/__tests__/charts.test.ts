import { renderNumberLabels, renderDateLabels } from 'lib/charts';
import { formatDate } from 'lib/date';

// test for renderNumberLabels

describe('renderNumberLabels', () => {
  test.each([
    ['1000000', '1.0m'],
    ['2500000', '2.5m'],
  ])("formats numbers ≥ 1 million as 'Xm' (%s → %s)", (input, expected) => {
    expect(renderNumberLabels(input)).toBe(expected);
  });

  test.each([['150000', '150k']])("formats numbers ≥ 100K as 'Xk' (%s → %s)", (input, expected) => {
    expect(renderNumberLabels(input)).toBe(expected);
  });

  test.each([['12500', '12.5k']])(
    "formats numbers ≥ 10K as 'X.Xk' (%s → %s)",
    (input, expected) => {
      expect(renderNumberLabels(input)).toBe(expected);
    },
  );

  test.each([['1500', '1.50k']])("formats numbers ≥ 1K as 'X.XXk' (%s → %s)", (input, expected) => {
    expect(renderNumberLabels(input)).toBe(expected);
  });

  test.each([['999', '999']])(
    'calls formatNumber for values < 1000 (%s → %s)',
    (input, expected) => {
      expect(renderNumberLabels(input)).toBe(expected);
    },
  );

  test.each([
    ['0', '0'],
    ['-5000', '-5000'],
  ])('handles edge cases correctly (%s → %s)', (input, expected) => {
    expect(renderNumberLabels(input)).toBe(expected);
  });
});

// test for renderDateLabels

jest.spyOn(require('lib/date'), 'formatDate'); // Spy on formatDate but use real implementation

describe('renderDateLabels', () => {
  const mockValues = [{ value: '2024-03-23T10:00:00Z' }, { value: '2024-03-24T15:30:00Z' }];

  test.each([
    ['minute', 'h:mm', 'en-US'],
    ['hour', 'p', 'en-US'],
    ['day', 'MMM d', 'en-US'],
    ['month', 'MMM', 'en-US'],
    ['year', 'YYY', 'en-US'],
  ])('formats date correctly for unit: %s', (unit, expectedFormat, locale) => {
    const formatLabel = renderDateLabels(unit, locale);
    const formatted = formatLabel('label', 0, mockValues);

    expect(formatDate).toHaveBeenCalledWith(new Date(mockValues[0].value), expectedFormat, locale);
    expect(formatted).toBe(formatDate(new Date(mockValues[0].value), expectedFormat, locale));
  });

  test('returns label for unknown unit', () => {
    const formatLabel = renderDateLabels('unknown', 'en-US');
    expect(formatLabel('original-label', 0, mockValues)).toBe('original-label');
  });

  test('handles invalid date gracefully', () => {
    const invalidValues = [{ value: 'invalid-date' }];
    const formatLabel = renderDateLabels('day', 'en-US');

    expect(() => formatLabel('label', 0, invalidValues)).toThrow();
  });
});
