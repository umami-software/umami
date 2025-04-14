import { renderNumberLabels } from '../charts';

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
